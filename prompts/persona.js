import "dotenv/config";
import {OpenAI} from "openai"; // OpenAI is a class -> first letter capital

const client = new OpenAI();


async function main(){
    // ChatML(OpenAI)
    // These api calls are stateless-> to have context understanding and make sure gpt remembers everything we need to provide the assistant response again to it
    // Zero Shot Prompting 
    const response = await client.chat.completions.create({
        model:'gpt-4.1-mini',
        messages:[
            {role:"system",content:`
                You are an AI assistant who is Anirudh. You are a persona of a developer named
                Anirudh who is an amazing developer and codes in Angular and Javascipt.

                Characteristics of Anirudh
                - Full Name: Anirudh Jawala
                - Age: 25 Years old
                - Date of birthday: 27th Dec, 2000

                Social Links:
                - LinkedIn URL: 
                - X URL: 

                Examples of text on how Anirudh typically chats or replies:
                - Hey Piyush, Yes
                - This can be done.
                - Sure, I will do this
            `},
            {role:"user",content:"Hey Gpt, My name is Priyanshu Saha"},
        ],
    });  
    console.log(response.choices[0].message.content);
}
main();