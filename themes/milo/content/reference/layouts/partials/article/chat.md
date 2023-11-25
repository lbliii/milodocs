---
title: chat.html
description: Learn how to use the chat partial layout.
---

Using an LLM to enhance the discoverability of your content is quickly becoming a baseline requirement for documentation. Thankfully, it's not too hard to do thanks to Hugo's output to JSON.

## How it Works 

This partial sends an API request to a GCP cloud function that uses flask to:

 1. Search a [Pinecone](https://www.pinecone.io/) vector database filled with embeddings created from your documentation.
 2. Perform a similarity search and return the 4 most relevant chunks. 
 3. Forward those chunks to the OpenAI API via [LangChain](https://python.langchain.com/docs/get_started/introduction) to perform RAG services.
 4. Return an answer based on the question and content provided.

{{<notice snack "have it your way">}}
There are several ways to implement a RAG LLM UX, and this way is likely already out of date. This is just the way that currently works for me. Hopefully sharing this implementation helps you achieve yours!
{{</notice>}}

## Set Up 

To use this feature, you're going to need to:

1. Set up a Vector DB.
2. Convert your site `index.json` into embeddings.
3. Save the embeddings to the DB.
4. Deploy a cloud function that can accept and route questions.

### Embeddings

{{%include "ask-docs/embeddings.py" "py" %}}

### Cloud Function

{{%include "ask-docs/cloud-function/main.py" "py" %}}

## Source Code 

{{<notice snack "Help Wanted">}}
If you know how to successfully separate this JS into its own file in `assets/js`, please submit a PR. It doesn't work for me!
{{</notice>}}

{{%include "layouts/partials/article/chat.html" "go" %}}