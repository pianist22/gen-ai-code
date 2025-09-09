import "dotenv/config";
import {OpenAI} from "openai"; // OpenAI is a class -> first letter capital

const client = new OpenAI();


async function main(){
    // ChatML(OpenAI)
    // These api calls are stateless-> to have context understanding and make sure gpt remembers everything we need to provide the assistant response again to it
    // Chain of Though Prompting
    const SYSTEM_PROMPT = `
        You are an AI assistant who works on START, THINK and OUTPUT format.
        For a given user query first think and breakdown the problem into sub problems.
        You should always keep thinking and thinking before giving the actual output.
        Also, before outputing the final result to user you must check once if everything is correct.

        Rules:
        - Strictly follow the output JSON format
        - Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
        - After evey think, there is going to be an EVALUATE step that is performed manually by someone and you need to wait for it.
        - Always perform only one step at a time and wait for other step.
        - Alway make sure to do multiple steps of thinking before giving out output.

        Output JSON Format:
        { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }

        Example:
        User: Can you solve 3 + 4 * 10 - 4 * 3
        ASSISTANT: { "step": "START", "content": "The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem" } 
        ASSISTANT: { "step": "THINK", "content": "This is typical math problem where we use BODMAS formula for calculation" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Lets breakdown the problem step by step" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "As per bodmas, first lets solve all multiplications and divisions" }
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
        ASSISTANT: { "step": "THINK", "content": "So, first we need to solve 4 * 10 that is 40" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 4 * 3" }
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Now, I can see one more multiplication to be done that is 4 * 3 = 12" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 12" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "As we have done all multiplications lets do the add and subtract" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "so, 3 + 40 = 43" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "new equations look like 43 - 12 which is 31" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "great, all steps are done and final result is 31" }
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
        ASSISTANT: { "step": "OUTPUT", "content": "3 + 4 * 10 - 4 * 3 = 31" } 
    `;
    const messages = [
        {role:"system",content:SYSTEM_PROMPT},
        {role:"user",content:"Hey, Can you Solve 4 * 6 - 12 * 34 / 7 * 21"},
        // {role:"user",content:"Write a JS code to find prime numbers as fast as possible"},
    ];

    while(true){
        const response = await client.chat.completions.create({
            model:'gpt-4.1-mini',
            messages:messages,
        });
        
        const rawContent = response.choices[0].message.content;
        const parsedContent = JSON.parse(rawContent);
        console.log(parsedContent);

        messages.push(
            {
                role:"user",
                content:JSON.stringify(parsedContent),
            }
        );
        if (parsedContent.step === 'START') {
        console.log(`🔥`, parsedContent.content);
        continue;
        }

        if (parsedContent.step === 'THINK') {
        console.log(`🧠`, parsedContent.content);
        // Todo: Send the messages as history to maybe gemini and ask for a review and append it to history
        // LLM as a judge techniuqe
        // console.log(`🔍`, evaluateContent);
        messages.push({
            role: 'developer',
            content: JSON.stringify({
            step: 'EVALUATE',
            content: 'Alright, Going good',
            }),
        });
        continue;
        }
        if (parsedContent.step === 'OUTPUT') {
        console.log(`🤖`, parsedContent.content);
        break;
        }
    }
    console.log("Done...")

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
    // console.log(response.choices[0].message.content);
}
main();