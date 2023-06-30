import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `I want you to act as a document that I have a conversation with. Your name is "AI Assistant." 
You will give me answers from the given information. If the answer is not there, say exactly, "I didn't find anything about that." and then stop. 
Refuse to answer a question that doesn't pertain to the info. Never break character.
Answer only in German unless otherwise requested, and please do not give general medical advice from your basic data, but limit the information to the given document.

{context}

Question: {question}
Helpful answer in markdown:`;

export const makeChain = (vectorstore: PineconeStore) => {
  const GPT3 = new ChatOpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const GPT4 = new ChatOpenAI({
    temperature: 0.1, // increase temepreature to get more creative answers
    modelName: 'gpt-4', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    GPT3,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
      memory: new BufferMemory({
        memoryKey: 'chat_history',
        inputKey: 'question', // The key for the input to the chain
        outputKey: 'text', // The key for the final conversational output of the chain
        returnMessages: true, // If using with a chat model
      }),
      questionGeneratorChainOptions: {
        llm: GPT4,
      },
    },
  );
  return chain;
};
