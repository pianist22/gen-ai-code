import { Tiktoken } from "js-tiktoken/lite";
import o200k_base from "js-tiktoken/ranks/o200k_base";

const enc = new Tiktoken(o200k_base);

const userQuery = "Hello, I am Priyanshu Saha.";

// Converting text to token format
const tokens = enc.encode(userQuery);
console.log({tokens});

// again converting token back to text form
const decoded = enc.decode(tokens);
console.log( {decoded});

function predictNextToken(tokens){
    // magic code
    return 6567;
}

while(true){
    const nextToken = predictNextToken(tokens);
    if(nextToken === "END") break;
    tokens.push(nextToken);
}