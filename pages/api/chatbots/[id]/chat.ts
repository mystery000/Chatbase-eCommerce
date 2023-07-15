import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/lib/pinecone/makechain';
import { pinecone } from '@/lib/pinecone/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { BAD_METHOD, ERROR } from '@/config/HttpStatus';
import rateLimiterMiddleware from '@/lib/middleware/rate-limit';
import excuteQuery from '@/lib/mysql';
import { Chatbot } from '@/types/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const chatbot_id = req.query.id;
  const { question } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(BAD_METHOD).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  // Rate Limit for API endpoint
  const data: Chatbot[] = (await excuteQuery({
    query: 'SELECT * from chatbots WHERE chatbot_id=(?)',
    values: [chatbot_id],
  })) as Chatbot[];

  const chatbot: Chatbot = data[0];

  const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
  if (Array.isArray(ip) || !ip) return;

  if (
    !rateLimiterMiddleware({
      ip,
      rateLimit: chatbot.ip_limit,
      windowMs: chatbot.ip_limit_timeframe * 1000,
    })
  ) {
    return res.status(429).json({ message: chatbot.ip_limit_message });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: Array.isArray(chatbot_id) ? chatbot_id[0] : chatbot_id, //namespace comes from your config folder
      },
    );

    //create chain
    const chain = makeChain(vectorStore);
    //Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
    });
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(ERROR).json({ error: error.message || 'Something went wrong' });
  }
}
