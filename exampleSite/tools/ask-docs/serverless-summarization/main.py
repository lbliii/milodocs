import os
import argparse
from dotenv import load_dotenv
import functions_framework
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai.chat_models import ChatOpenAI

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

TEMPLATE = """Summarize this article:
{context}
"""
PROMPT = ChatPromptTemplate.from_template(TEMPLATE)
MODEL = ChatOpenAI(model="gpt-4", api_key=OPENAI_API_KEY)
OUTPUT_PARSER = StrOutputParser()

@functions_framework.http
def start(request):
    HEADERS = {
        'Access-Control-Allow-Origin': '*',  # Allow all domains
        'Access-Control-Allow-Methods': 'GET, POST',  # Correctly formatted methods
        'Access-Control-Allow-Headers': 'Content-Type',  # Specify allowed headers
        'Access-Control-Max-Age': '3600'  # Indicates how long the results of a preflight request can be cached
    }

    # Handling preflight requests
    if request.method == 'OPTIONS':
        return ('', 204, HEADERS)
    
    request_json = request.get_json(silent=True)
    request_args = request.args

    # Get the article context either from JSON body or URL query parameters
    articleContext = request_json.get('context') if request_json else request_args.get('context', 'There is no article to summarize.')

    CHAIN = PROMPT | MODEL | OUTPUT_PARSER

    # Execute the chain to generate the summarization
    answer = CHAIN.invoke({"context": articleContext})
    response = {"summarization": answer}

    return (response, 200, HEADERS)