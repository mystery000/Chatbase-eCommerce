import type { NextApiRequest, NextApiResponse } from 'next';
import excuteQuery from '@/lib/mysql';
import { Chatbot } from '@/types/supabase';
import { BAD_REQUEST, ERROR, NOT_FOUND, SUCCESS } from '@/config/HttpStatus';
import { pinecone } from '@/lib/pinecone/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | Chatbot;

const allowedMethods = ['GET', 'PATCH', 'DELETE'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  const chatbotId = req.query.id as Chatbot['chatbot_id'];

  if (req.method === 'GET') {
    if (!chatbotId) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'Invalid request: chatbot id is missing now.' });
    }
    try {
      const chatbot = await excuteQuery({
        query: 'SELECT * FROM chatbots WHERE chatbot_id=(?)',
        values: [chatbotId],
      });
      if (!chatbot)
        return res
          .status(NOT_FOUND)
          .json({ error: `There is no chatbot with id is ${chatbotId}` });
      return res
        .status(SUCCESS)
        .json(Array.isArray(chatbot) ? chatbot[0] : chatbot);
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Internal Server Error: due to ${error}` });
    }
  }
  if (req.method === 'DELETE') {
    if (!chatbotId) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'Invalid request: chatbot id is missing now.' });
    }
    try {
      const index = pinecone.Index(PINECONE_INDEX_NAME);
      await index.delete1({ deleteAll: true, namespace: chatbotId });

      const chatbot = await excuteQuery({
        query: 'DELETE FROM chatbots WHERE chatbot_id=(?)',
        values: [chatbotId],
      });

      if (!chatbot)
        return res
          .status(NOT_FOUND)
          .json({ error: `There is no chatbot with id is ${chatbotId}` });
      return res.status(SUCCESS).json({ status: 'OK' });
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Internal Server Error: due to ${error}` });
    }
  }
}
