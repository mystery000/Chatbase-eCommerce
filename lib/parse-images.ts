import type { NextApiRequest } from 'next';
import mime from 'mime';
import { join } from 'path';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, stat } from 'fs/promises';

export const parseImages = async (
  req: NextApiRequest,
): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
  avatars: { chatbot: string; profile: string };
}> => {
  return new Promise(async (resolve, reject) => {
    const identifier = uuidv4();
    const prefix = '/images';
    let avatars: { chatbot: string; profile: string } = {
      chatbot: '',
      profile: '',
    };

    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/public/images`,
    );
    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        await mkdir(uploadDir, { recursive: true });
      } else {
        reject(e);
      }
    }

    const form = formidable({
      multiples: true,
      maxFiles: 2,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      uploadDir,
      filename: (_name, _ext, part) => {
        const filename = `${identifier}-${_name}.${
          mime.getExtension(part.mimetype || '') || 'unknown'
        }`;
        if (!part.mimetype?.startsWith('image')) return filename;
        if (part.name === 'avatar_chatbot') {
          avatars.chatbot = `${prefix}/${filename}`;
        } else {
          avatars.profile = `${prefix}/${filename}`;
        }
        return filename;
      },
      filter: (part) => part.mimetype?.startsWith('image/') || false,
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files, avatars });
    });
  });
};
