import type { NextApiRequest, NextApiResponse } from 'next';

type Data =
  | {
      status?: string;
      error?: string;
    }
  | { size: number };

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
    const websiteRes = await fetch(url);
    if (websiteRes.ok) {
      const content = await websiteRes.text();
      console.log(content);
      return res.status(200).json({ size: content.length || 0 });
    }
  } catch {
    // Handle below
  }

  return res.status(400).json({ status: 'Page is not accessible' });
}
