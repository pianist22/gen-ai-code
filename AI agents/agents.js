import "dotenv/config";
import {OpenAI} from "openai"; // OpenAI is a class -> first letter capital
import axios from "axios";
import {exec} from "child_process";

async function getWeatherDetailsByCity(cityName = ''){
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const { data } = await axios.get(url, { responseType: 'text' });
  return `The current weather of ${cityName} is ${data}`;
}
// getWeatherDetailsByCity("Patiala").then((data)=> console.log(data));
// whether this openAI LLM can call this javascript function defined on our machine to check the weather details => NO this is wrong 
// we can do this by using prompt engineering

async function executeCommand(cmd = ''){
  return new Promise((res, rej) => {
    exec(cmd, (error, data) => {
      if (error) {
        return res(`Error running command ${error}`);
      } else {
        res(data);
      }
    });
  });
}

async function getGithubUserInfoByUsername(username = ''){
    const url = `https://api.github.com/users/${username.toLowerCase()}`;
    const { data } = await axios.get(url);
    return JSON.stringify({
        login: data.login,
        id: data.id,
        name: data.name,
        location: data.location,
        twitter_username: data.twitter_username,
        public_repos: data.public_repos,
        public_gists: data.public_gists,
        user_view_type: data.user_view_type,
        followers: data.followers,
        following: data.following,
    });
}

const TOOL_MAP = {
    "getWeatherDetailsByCity": getWeatherDetailsByCity,
    "getGithubUserInfoByUsername": getGithubUserInfoByUsername,
    "executeCommand": executeCommand
};

// PRISMA-> ORM- Create,Read,Update,Delete

const client = new OpenAI();

async function main(){
    // ChatML(OpenAI)
    // These api calls are stateless-> to have context understanding and make sure gpt remembers everything we need to provide the assistant response again to it
    // Chain of Though Prompting
    const SYSTEM_PROMPT = `
        You are an AI assistant who works on START, THINK,OBSERVE, TOOL and OUTPUT format.
        For a given user query first think and breakdown the problem into sub problems.
        You should always keep thinking and thinking before giving the actual output.
        Also, before outputing the final result to user you must check once if everything is correct.
        You also have a list of available tools that you can call based on the user's query.
        For every tools call that you make, wait for the OBSERVATION from the tool which is the response from the tool that you called

        Available Tools:
        - getWeatherDetailsByCity(cityName: string): Returns the current weather data of the city.
        - getGithubUserInfoByUsername(username: string): Returns the user information from github using public API
        - executeCommand(command: string): Takes a unix/linux command as argument and execute it on user's machine and return the response

        Rules:
        - Strictly follow the output JSON format
        - Always follow the output in sequence that is START, THINK, OBSERVE, TOOL and OUTPUT.
        - Always perform only one step at a time and wait for other step.
        - Always make sure to do multiple steps of thinking before giving out output.
        - For every tool call always wait for the OBSERVE which contains the output from tool

        Output JSON Format:
        { "step": "START | THINK | OBSERVE | TOOL |OUTPUT", "content": "string", "tool_name":"string", "input":"string"}

        Example:
        User: Can you tell me the weather of Patiala?
        ASSISTANT: { "step": "START", "content": "The user is interested in the current weather detail about Patiala" } 
        ASSISTANT: { "step": "THINK", "content": "Let me see of there is any available tools for this query" } 
        ASSISTANT: { "step": "THINK", "content": "I see that there is a tool called getWeatherDetailsByCity(cityName: string): Returns the current weather data of the city." } 
        ASSISTANT: { "step": "THINK", "content": "I need to call the getWeatherDetailsByCity for city patiala" }
        ASSISTANT: {"step": "TOOL", "input":"patiala","tool_name":"getWeatherDetailsByCity"}
        DEVELOPER: {"step": "OBSERVE", "content": "The current weather of patiala is cloudy with 27 cel"}
        ASSISTANT: {"step": "THINK", "content": "Great I have got the weather details of patiala"}
        ASSISTANT: {"step": "THINK", "content": "The weather of patiala is cloudy with 27 cel"}
        ASSISTANT: {"step": "OUTPUT", "content": "The weather in patiala is 27C with little cloudy. Please make sure to carry an umbrella☂️"}
    `;
    const messages = [
        {role:"system",content:SYSTEM_PROMPT},
        // {role:"user",content:"What is the weather of Delhi?"}
        // {role:"user",content:"What is the weather of Delhi,Patiala and Jaipur.Also tell me the average weather of these three places."}
        // {role:"user",content:"Tell me the number of followers and following pianist22 has in his github profile."}
        // {role:"user",content:"Hey, create a folder todo_app and create a simple todo app using html, css and javascript. Make sure to create seperate files for HTML,CSS and JS files. Make sure to include working code in all the files that you will create to make the todo application in the working state when user can add or delete todo items simply and properly show the list of todo item created by the user as well"}
        {role:"user",content:"Hey In my Current working directory, I want to push all my code changes to my git Repository whose remote origin has already been added. I want you to push all my code changes to my Git Repository with a Good Commit message.Make sure to do it properly without any error."}
        // {role:"user",content:"Make sure to run the push command to push my code in the repository"}
    ];

    while(true){
        const response = await client.chat.completions.create({
            model:'gpt-4.1',
            response_format: { type: 'json_object' },
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
        continue;
        }
        if(parsedContent.step === 'TOOL'){
            const toolToCall = parsedContent.tool_name;
            if(!TOOL_MAP[toolToCall]){
                messages.push({
                    role:"developer",
                    content:`I don't have a tool called ${toolToCall}`
                });
                continue;
            }
            const toolInput = parsedContent.input;
            const toolResponse = await TOOL_MAP[toolToCall](toolInput);
            console.log(`🛠️ : ${toolToCall}(${parsedContent.input})=`, toolResponse);
            messages.push({
                role:"developer",
                content: JSON.stringify({
                    step:"OBSERVE",
                    content:toolResponse}),
            });
            continue;
        }
        if (parsedContent.step === 'OUTPUT') {
        console.log(`🤖`, parsedContent.content);
        break;
        }
    }
    console.log("Done...");
}
main();