import "dotenv/config";
import {OpenAI} from "openai"; // OpenAI is a class -> first letter capital

const client = new OpenAI();

const client2 = new OpenAI({
    apiKey:'AIzaSyA0M-y9GhPBUQrSZvJHAwcawah__N-C3w0',
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function main(){
    // ChatML(OpenAI)
    // These api calls are stateless-> to have context understanding and make sure gpt remembers everything we need to provide the assistant response again to it
    // Chain of Though Prompting
    const SYSTEM_PROMPT = `You are an AI assistant responding using a step-by-step process with strict sequencing and output format.

    Your task for every user query is to:
    - Break the main problem into smaller subproblems, thinking thoroughly at every stage.
    - Output **only one step at a time**: either "START", "THINK", "EVALUATE" (performed manually), or "OUTPUT".
    - After every THINK step, you must wait for EVALUATE feedback before proceeding.
    - If the most recent EVALUATE content is negative, you must reconsider your last THINK step, take a different approach, and propose a new THINK step, then wait for another EVALUATE.
    - Only continue to THINK or to OUTPUT after receiving a positive EVALUATE response.
    - Continue this loop until all reasoning and breakdown is complete, then produce the OUTPUT.
    - Before OUTPUT, ensure you check your answer and reasoning for correctness.

    **Strictly follow this JSON output:**
    { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }

    ---

    **Examples:**

    User: Can you solve 2 * (3 + 7) - 5

    ASSISTANT: { "step": "START", "content": "User wants me to compute 2 * (3 + 7) - 5" }
    ASSISTANT: { "step": "THINK", "content": "I will use BODMAS to solve the equation." }
    [User EVALUATES: "Please try a different approach to explain BODMAS first."]
    ASSISTANT: { "step": "THINK", "content": "BODMAS stands for Brackets, Orders, Division/Multiplication, Addition/Subtraction. Let's identify brackets first." }
    [User EVALUATES: "Good, continue."]
    ASSISTANT: { "step": "THINK", "content": "First, solve inside brackets: 3 + 7 = 10. Now, equation is 2 * 10 - 5." }
    [User EVALUATES: "Continue."]
    ASSISTANT: { "step": "THINK", "content": "Next, multiply: 2 * 10 = 20. Now, equation is 20 - 5." }
    [User EVALUATES: "OK."]
    ASSISTANT: { "step": "THINK", "content": "Finally, subtract: 20 - 5 = 15. All steps done." }
    [User EVALUATES: "Looks correct."]
    ASSISTANT: { "step": "OUTPUT", "content": "The answer is 15." }

    ---

    **Rules:**
    - Never produce OUTPUT unless just after a positive EVALUATE.
    - Always output exactly one JSON response per turn.
    - Upon negative EVALUATE, revise your previous THINK or choose a new angle before moving forward.
    - Never merge steps; sequence must strictly alternate per EVALUATE feedback.
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
        // console.log(parsedContent);

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
        const evaluateResponse = await client2.chat.completions.create({
            model:"gemini-2.0-flash",
            messages:[
                {role:"user",content:"Can you evaluate the following and check whether is it correct or not and make sure to evaluation should response in positive or negative manner"},
                {role:"user",content:parsedContent.content},
            ]
        });
        const evaluateContent = evaluateResponse.choices[0].message.content;
        console.log(`🔍`, evaluateContent);
        messages.push({
            role: 'developer',
            content: JSON.stringify({
            step: 'EVALUATE',
            content: evaluateContent,
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