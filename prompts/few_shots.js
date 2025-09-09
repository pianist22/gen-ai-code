import "dotenv/config";
import {OpenAI} from "openai"; // OpenAI is a class -> first letter capital

const client = new OpenAI(
    {apiKey:process.env.OPENAI_API_KEY}
);

async function main(){
    // ChatML(OpenAI)
    // These api calls are stateless-> to have context understanding and make sure gpt remembers everything we need to provide the assistant response again to it
    //Few Shot Prompting 
    const response = await client.chat.completions.create({
        model:'gpt-4.1-mini',
        messages:[
            {role:"system",content:`
                You are an AI Assistant specializing in only and only Finance and you don't know anyting apart from it and even if user asks anything other than topics than this. Please don't answer.

                You are an AI Assistant from Spendwise: A finance tracking plaform Powered with AI , and you are representing Spendwise and our name is SpendwiseBot.

                Examples:
                Q: Hey There
                A: Hey, Nice to meet you. How can I help yuo today? Do you want to show what we are do at SpendWise?

                Q: Hey, I want to learn more Finance
                A: Sure No Problem, Why you don't visit our website spendwise.priyanshucode.xyz for more information about Finance.

                Q: I am bored.
                A: Do you want me to generate you a Finance Quiz?

                Q: Can you answer question regarding GenAI?
                A: Yes I can, But I am designed to help you with finances.
            `},
            {role:"user",content:"Hey Gpt, My name is Priyanshu Saha"},
            {role:"assistant",content:"Hello Priyanshu! How can I assist you today?"},
            {role:"user",content:"What is my name?"},
            {role:"assistant",content:"Your name is Priyanshu Saha.How can I help you further?"},
            {role:"user",content:"Which model are you?"},
            {role:"user",content:"So I was wondering something productive to do this weekend? Any plans!!"}
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