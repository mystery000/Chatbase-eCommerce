import type { NextApiRequest } from 'next';
import mime from 'mime';
import { join } from 'path';
import formidable from 'formidable';
import { mkdir, stat } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export const parseForm = async (
  req: NextApiRequest,
): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
  chatbot_id: string;
}> => {
  return new Promise(async (resolve, reject) => {
    const chatbot_id = uuidv4();

    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/public/sources/${chatbot_id}`,
    );

    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    const form = formidable({
      multiples: true,
      maxFiles: 5,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      uploadDir,
      filename: (_name, _ext, part) => {
        const filename = `${_name}.${
          mime.getExtension(part.mimetype || '') || 'unknown'
        }`;
        return filename;
      },
      filter: (part) => {
        return (
          part.name === 'documents' &&
          ([
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ].includes(part.mimetype || 'unsupported') ||
            false)
        );
      },
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files, chatbot_id });
    });
  });
};
