import os
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import JSONLoader
from langchain_pinecone import Pinecone as PC_Pinecone
from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone, ServerlessSpec, PodSpec
import time
from pprint import pprint

load_dotenv()

api_key = os.environ.get('PINECONE_API_KEY')
openai_key = os.environ.get('OPENAI_API_KEY')
pinecone_region = os.environ.get('PINECONE_REGION')
pinecone_cloud = os.environ.get('PINECONE_CLOUD')
pinecone_index = os.environ.get('PINECONE_INDEX')


pc = Pinecone(api_key=api_key)
use_serverless = True

if use_serverless:
    spec = ServerlessSpec(cloud=pinecone_cloud, region=pinecone_region)
else:
    spec = PodSpec()

# check for and delete index if already exists
index_name = pinecone_index
if index_name in pc.list_indexes().names():
    pc.delete_index(index_name)

# we create a new index
pc.create_index(
        index_name,
        dimension=1536,  # dimensionality of text-embedding-ada-002
        metric='dotproduct',
        spec=spec
    )

# wait for index to be initialized
while not pc.describe_index(index_name).status['ready']:
    time.sleep(1)

index = pc.Index(index_name)
index.describe_index_stats()

# Format and Chunk the Data 
embeddings = OpenAIEmbeddings(openai_api_key=openai_key)
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0,)

def metadata_func(record: dict, metadata: dict) -> dict:
    metadata["title"] = record.get("title")
    metadata["relURI"] = record.get("relURI")
    metadata["description"] = record.get("description")
    return metadata

loader = JSONLoader(
    file_path="../../public/index.json",
    jq_schema=".[]",
    metadata_func=metadata_func,
    content_key="body"
) 

data = loader.load()
pprint(data)
texts = text_splitter.split_documents(data) 
doc_search = PC_Pinecone.from_documents(texts, embeddings, index_name=index_name, namespace="milodocs")

pprint(doc_search)

index.describe_index_stats()