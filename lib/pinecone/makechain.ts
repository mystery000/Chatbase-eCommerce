import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { ChatOpenAI } from 'langchain/chat_models/openai';

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `I want you to act as a document I'm having a conversation with. Your name is "AI Assistant". 
You will give me answers based on the given information. If the answer isn't there, say specifically, "I couldn't find anything," and stop after that.
Refuse to answer a question that isn't about the information. Never break character.
Answer only in German if you can't respond in the language of the question, and please do not give any general medical advice from your basic data; limit the information to the document given.

{context}

Question: {question}
Helpful answer in markdown:`;

type MakeChainOptions = {
  CONDENSE_PROMPT?: string;
  QA_PROMPT?: string;
};

export const makeChain = (
  vectorstore: PineconeStore,
  options?: MakeChainOptions,
) => {
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
      qaTemplate: options?.QA_PROMPT || QA_PROMPT,
      questionGeneratorTemplate: options?.CONDENSE_PROMPT || CONDENSE_PROMPT,
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
