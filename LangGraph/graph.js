import 'dotenv/config';
import {ChatOpenAI} from "@langchain/openai";
import { StateGraph,Annotation,MessagesAnnotation} from '@langchain/langgraph'; // to create the workflow
import {HumanMessage,AIMessage} from "@langchain/core/messages";
import {z} from 'zod';

    const llm = new ChatOpenAI({
        model: "gpt-4.1-mini",
    });

    async function callOpenAI(state){
        console.log(`Inside callOpenAI`,state);

        const response = await llm.invoke(state.messages);
        
        // Whatever we are returning is the new state
        return{
            messages: [response],
        }
    }

    // async function runAfterCallOpenAI(state){
    //     console.log(`Inside runAfterCallOpenAI`,state);
    //     return{
    //         messages: ["Hey, I just added something runAfterCallOpenAI"],
    //     }
    // }

    const workflow = new StateGraph(MessagesAnnotation)
    .addNode("callOpenAI", callOpenAI)
    // .addNode("runAfterCallOpenAI", runAfterCallOpenAI)
    .addEdge('__start__', 'callOpenAI')
    // .addEdge('callOpenAI', 'runAfterCallOpenAI')
    // .addEdge('runAfterCallOpenAI', '__end__');
    .addEdge('callOpenAI', '__end__');

    const graph = workflow.compile();

async function runGraph(){
    // const userQuery = "Hey, My name is Priyanshu Saha";
    const userQuery = "What is 2 + 2?"

    const updatedState = await graph.invoke({
        messages: [new HumanMessage(userQuery)],
    });
    console.log(updatedState);
}
runGraph();


