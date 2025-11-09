import 'dotenv/config';
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAI } from "openai";

const client = new OpenAI();
async function chat(){
    const userQuery = 'Can you give me a function to add two numbers in python?';
    // Ready the client OpenAI embedding model
    const embeddings = new OpenAIEmbeddings({
        model:'text-embedding-3-small',
    });

    // Here connection is established with already existing vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
            url:'http://localhost:6333',
            collectionName:'robin-collection',
        }
    );

    const vectorSearcher = vectorStore.asRetriever({
        k:3,   
    });

    const relevantChunks = await vectorSearcher.invoke(userQuery);
    // Now after that we need to setup the system prompt with given context from relevantChunks and then ask the question and get the response from the assistant.

    const SYSTEM_PROMPT = `
        You are an AI assistant specializing in resolving user query based on the context available to you from a PDF file with the content and page number.

        Only answer based on the available context from file only.

        Context:
        ${JSON.stringify(relevantChunks)}
    `;

    const response = await client.chat.completions.create({
        model:'gpt-4.1-mini',
        messages:[
            {role:"system",content:SYSTEM_PROMPT},
            {role:"user",content:userQuery},
        ]
    });

    console.log("Answer: ",response.choices[0].message.content);
}
chat();