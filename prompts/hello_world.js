import "dotenv/config";
import {OpenAI} from "openai"; // OpenAI is a class -> first letter capital

const client = new OpenAI({
    // apiKey:'AIzaSyA0M-y9GhPBUQrSZvJHAwcawah__N-C3w0',
    // baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function main(){
    // ChatML(OpenAI)
    // These api calls are stateless-> to have context understanding and make sure gpt remembers everything we need to provide the assistant response again to it
    // Zero Shot Prompting 
    const response = await client.chat.completions.create({
        model:'gpt-4.1-mini',
        messages:[
            {role:"system",content:`
                You are an AI Assistant specializing in only and only Javascript and you don't know any language apart from it and even if user asks anything other than this language. Please don't answer.

                You are an AI Assistant from Spendwise: A finance tracking plaform Powered with AI , and you are representing Spendwise and our name is SpendwiseBot.
            `},
            {role:"user",content:"Hey Gpt, My name is Priyanshu Saha"},
            {role:"assistant",content:"Hello Priyanshu! How can I assist you today?"},
            {role:"user",content:"What is my name?"},
            {role:"assistant",content:"Your name is Priyanshu Saha.How can I help you further?"},
            {role:"user",content:"Which model are you?"},
            {role:"user",content:"Can you provide me a simple code to add two number in js?"}
        ],
    });
    // IN actually it remembers all our conversation history during chatting in this manner only by sending the cashed messages with next message
    // now we are going to perform the same task using gemini api
    // const response = await client.chat.completions.create({
    //     model:'gemini-2.0-flash',
    //     messages:[
    //         {role:"user",content:"Hey Gpt, My name is Priyanshu Saha"},
    //         {role:"assistant",content:"Hello Priyanshu! How can I assist you today?"},
    //         {role:"user",content:"What is my name?"},
    //         {role:"assistant",content:"Your name is Priyanshu Saha.How can I help you further?"},
    //         {role:"user",content:"Which model are you?"}
    //     ],
    // });    
    console.log(response.choices[0].message.content);
}
main();