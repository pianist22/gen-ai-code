import 'dotenv/config';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";


async function init(){
    // Provide the file path
    const pdfFilePath = 'nodejs.pdf';

    const loader = new PDFLoader(pdfFilePath);
    // return the document page by page from PDF where one page-> document
    // docs-> document[]
    const docs = await loader.load();

    // Ready the client OpenAI embedding model
    const embeddings = new OpenAIEmbeddings({
        model:'text-embedding-3-small',
    });
    // This function will loops over to the docs and convert them into vector embeddings using OpenAI embedding model and store them in qdrant DB.
    const vectorStore = await QdrantVectorStore.fromDocuments(docs,embeddings,{
        url:'http://localhost:6333',
        collectionName:'robin-collection',
    });

    console.log('Indexing of Document is done.');
}

init();