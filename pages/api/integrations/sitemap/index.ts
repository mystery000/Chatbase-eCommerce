import { CrawledData } from '@/types/types';
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
    const sitemapRes = await fetch(url);
    if (sitemapRes.ok) {
      const content = await sitemapRes.text();
      return res
        .status(200)
        .json({ content: content, characters: content.length || 0 });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  return res.status(400).json({ error: 'Page is not accessible' });
}
