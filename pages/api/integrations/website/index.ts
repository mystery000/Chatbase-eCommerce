import { CrawledData } from '@/types/types';
import axios from 'axios';
import cheerio from 'cheerio';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | CrawledData;

const allowedMethods = ['POST'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader('Allow', allowedMethods);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const url = req.body.url as string;
  if (!url) {
    return res.status(400).json({
      error: 'Invalid request. Please provide a url.',
    });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const text = $('body')
      .find('*')
      .not('script, style')
      .map((_, element) => $(element).text())
      .get()
      .join(' ');
    return res
      .status(200)
      .json({ characters: text.length || 0, content: text });
  } catch {
    return res.status(400).json({ error: 'Invalid requests' });
  }

  return res.status(400).json({ error: 'Page is not accessible' });
}
