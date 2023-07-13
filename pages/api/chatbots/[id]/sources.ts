import excuteQuery from '@/lib/mysql';
import { Chatbot, Source } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { BAD_METHOD, BAD_REQUEST, ERROR, SUCCESS } from '@/config/HttpStatus';

type Data = { status?: string; error?: string } | Source[] | Source;

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
  const chatbotId = req.query.id as Chatbot['chatbot_id'];
  if (req.method === 'GET') {
    if (!chatbotId) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'Invalid request: chatbot id is missing now.' });
    }
    try {
      const sources = await excuteQuery({
        query: 'SELECT * FROM sources WHERE chatbot_id=(?)',
        values: [chatbotId],
      });
      return res.status(SUCCESS).json(sources || []);
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Internal Server Error: due to ${error}` });
    }
  }

  return res.status(SUCCESS).json({ status: 'ok' });
}
