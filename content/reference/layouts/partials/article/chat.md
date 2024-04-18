---
title: chat.html
description: Learn how to use the chat partial layout.
---

{{<notice warning "Out of Date" >}}
The steps in this article are out of date. An updated version is coming soon.
{{</notice>}}

Using an LLM to enhance the discoverability of your content is quickly becoming a baseline requirement for documentation. Thankfully, it's not too hard to do thanks to [Hugo's output to JSON](https://gohugo.io/methods/page/outputformats/).

 At a high level, you'll need to provide some server-side code in Python or JS that routes user questions to chatGPT after being passed some embeddings (created from your docs JSON) for context.

## How it Works 

This partial sends an API request to a GCP cloud function you'll need to set up that uses [Flask](https://flask.palletsprojects.com/en/3.0.x/) (built in) to:

 1. Search a [Pinecone](https://www.pinecone.io/) vector database filled with embeddings created from your documentation.
 2. Perform a similarity search and return the 4 most relevant chunks. 
 3. Forward those chunks to the OpenAI API via [LangChain](https://python.langchain.com/docs/get_started/introduction) to perform RAG services.
 4. Return an answer based on the question and content provided.

{{<notice snack "have it your way">}}
There are several ways to implement a RAG LLM UX --- this is just the way that currently works for me. It seems like in the future people may shift from LangChain to the official [Assistant API](https://platform.openai.com/docs/assistants/overview). Hopefully sharing this implementation helps you achieve yours!
{{</notice>}}

## Set Up 

To use this feature, you're going to need to:

1. Set up a Vector DB (doesn't have to be Pinecone, LangChain supports multiple options).
2. Convert your site `index.json` into embeddings and save them to the DB.
3. Deploy a cloud function that can accept and route questions.

{{<notice warning "python 3.12">}}
The `tiktoken` requirement runs into issues on Python 3.12; for now, I recommend using 3.10 if deploying with a GCP function.
{{</notice>}}

### Create & Store Embeddings

{{%include "tools/ask-docs/embeddings.py" "py" %}}

### Deploy Cloud Function

{{%include "tools/ask-docs/cloud-function/main.py" "py" %}}

## Source Code 

{{<notice snack "Help Wanted">}}
If you know how to successfully separate this JS into its own file in `assets/js`, please submit a PR. It doesn't work for me!
{{</notice>}}

{{%include "layouts/partials/article/chat.html" "go" %}}