import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as textract from 'textract';
import { IncomingForm } from 'formidable';
import { mkdir, stat } from 'fs/promises';
import { NextApiRequest, NextApiResponse } from 'next';
import { BAD_METHOD, ERROR } from '@/config/HttpStatus';

type Data = { status?: string; error?: string } | string;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const allowMethods = ['GET', 'POST'];

  if (!req.method || !allowMethods.includes(req.method)) {
    res.setHeader('Allow', allowMethods);
    return res
      .status(BAD_METHOD)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  if (req.method === 'POST') {
    const tempId = uuidv4();
    try {
      const uploadDir = join(
        process.env.ROOT_DIR || process.cwd(),
        `/public/temp`,
      );

      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === 'ENOENT') {
          await mkdir(uploadDir, { recursive: true });
        } else {
          console.error(e);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      }

      const form = new IncomingForm({
        uploadDir,
        filter: (part) => part.mimetype === 'application/msword' || false,
        filename: (_name, _ext, part) => `${tempId}.doc`,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const filePath = `${uploadDir}/${tempId}.doc`;
        textract.fromFileWithPath(filePath, (error, text) => {
          fs.unlink(filePath, (err) => {
            console.log(err);
            return res.status(500).json({ error: 'Internal server error' });
          });
          return res.status(200).json(text);
        });
      });
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Failed to read the file: due to ${error}` });
    }
  }
}
