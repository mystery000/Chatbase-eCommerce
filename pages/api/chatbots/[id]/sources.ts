import { BAD_METHOD, ERROR, SUCCESS } from '@/config/HttpStatus';
import excuteQuery from '@/lib/mysql';
import { Source } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';

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

  if (req.method === 'GET') {
    try {
      const sources = await excuteQuery({
        query: 'SELECT * FROM sources',
        values: [],
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
