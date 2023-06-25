import { BAD_METHOD, BAD_REQUEST, ERROR, SUCCESS } from '@/config/HttpStatus';
import excuteQuery from '@/lib/database';
import { Chatbot } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

type Data = { status?: string; error?: string } | Chatbot[] | Chatbot;

const allowMethods = ['GET', 'POST'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowMethods.includes(req.method)) {
    res.setHeader('Allow', allowMethods);
    return res
      .status(BAD_METHOD)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  // Unauthorized

  if (req.method === 'GET') {
    try {
      const chatbots = await excuteQuery({
        query: 'SELECT * FROM chatbots',
        values: [],
      });
      return res.status(SUCCESS).json(chatbots || []);
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Internal Server Error: due to ${error}` });
    }
  } else if (req.method === 'POST') {
    const { name } = req.body;
    const chatbot_id = uuidv4();
    const created_at = new Date();

    if (!name) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'The request body has no chatbot name' });
    }
    //pinecone

    try {
      await excuteQuery({
        query:
          'insert into chatbots (chatbot_id, name, created_at) values (?,?,?)',
        values: [chatbot_id, name, created_at],
      });
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Internal Server Error: due to ${error}` });
    }

    return res.status(SUCCESS).json({ chatbot_id, name, created_at });
  }

  return res.status(SUCCESS).json({ status: 'ok' });
}
