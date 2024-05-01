import os 
import functions_framework
from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_openai.chat_models import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore as LC_Pinecone
from pinecone import Pinecone

load_dotenv()

PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
INDEX_NAME = "milodocs"
NAMESPACE = "milodocs"
PC = Pinecone(api_key=PINECONE_API_KEY)
INDEX = PC.Index(INDEX_NAME)
EMBEDDINGS = OpenAIEmbeddings(api_key=OPENAI_API_KEY)


TEMPLATE = """You are a technical writer and Hugo Site Generator expert named Milo. You help people answer questions about the Milo Docs theme. Answer the question based only on the following context:
{context}

Question: {question}
"""
PROMPT = ChatPromptTemplate.from_template(TEMPLATE)
MODEL = ChatOpenAI(model="gpt-4", api_key=OPENAI_API_KEY)
OUTPUT_PARSER = StrOutputParser()

@functions_framework.http
def start(request):
    HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }
    if request.method == 'OPTIONS':
        return ('', 204, HEADERS)

    request_json = request.get_json(silent=True)
    request_args = request.args

    question = request_json.get('query') if request_json else request_args.get('query', 'What is Hugo?')
    productFilter = request_json.get('productFilter') if request_json else request_args.get('productFilter')

    # Create a retriever instance for each request with the current productFilter
    VS = LC_Pinecone(
        index_name=INDEX_NAME,
        embedding=EMBEDDINGS,
        namespace=NAMESPACE,
        pinecone_api_key=PINECONE_API_KEY,
    )
    if productFilter:
        # If a productFilter is provided, use it to filter the results based on that metadata
        RETRIEVER = VS.as_retriever(
            search_kwargs={'filter': {'productPath': productFilter or None}}
        )
    else:
        # Search all documents if no productFilter is provided
        RETRIEVER = VS.as_retriever()

    # Setup the chain dynamically
    SETUP_AND_RETRIEVAL = RunnableParallel(
        {"context": RETRIEVER, "question": RunnablePassthrough()}
    )
    CHAIN = (SETUP_AND_RETRIEVAL | PROMPT | MODEL | OUTPUT_PARSER)

    answer = CHAIN.invoke(question)
    response = { "answer": answer }

    return (response, 200, HEADERS)