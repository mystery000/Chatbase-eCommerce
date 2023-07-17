import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import excuteQuery from '@/lib/mysql';
import { Chatbot } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { pinecone } from '@/lib/pinecone/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { BaseDocumentLoader } from 'langchain/document_loaders/base';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured';
import { PuppeteerWebBaseLoader } from 'langchain/document_loaders/web/puppeteer';
import { BAD_METHOD, BAD_REQUEST, ERROR, SUCCESS } from '@/config/HttpStatus';

import {
  DEFAULT_MODEL_CONFIG,
  DEFAULT_CONFIG_VALUES,
  DEFAULT_CONTACT_INFO,
  DEFAULT_ICONS_PATH,
} from '@/config/chabot';

// formidable
import mime from 'mime';
import { join } from 'path';
import { IncomingForm } from 'formidable';
import { parseForm } from '@/lib/parse-form';

type Data = { status?: string; error?: string } | Chatbot[] | Chatbot;

const allowMethods = ['GET', 'POST', 'PATCH'];

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    try {
      const { fields, files, chatbot_id } = await parseForm(req);
      const name = fields.name[0];
      const text = fields.text[0];
      const urls = fields.urls;
      const created_at = new Date();

      if (!name || !chatbot_id) {
        return res.status(BAD_REQUEST).json({
          error: 'There is no chatbot name in the request body.',
        });
      }

      if (!files && !urls && !text)
        return res.status(BAD_REQUEST).json({
          error: 'There is no provided sources',
        });

      try {
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        /*create and store the embeddings in the vectorStore*/
        const embeddings = new OpenAIEmbeddings();
        const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

        // embed the PDF documents
        const pineconeStore = new PineconeStore(embeddings, {
          pineconeIndex: index,
          namespace: chatbot_id,
          textKey: 'text',
        });

        /*load raw docs from the all files in the directory */
        fs.readdirSync(`public/sources/${chatbot_id}`).forEach(async (file) => {
          const path = `public/sources/${chatbot_id}/${file}`;
          let loader: BaseDocumentLoader = new PDFLoader(path);
          if (path.endsWith('.pdf')) loader = new PDFLoader(path);
          if (path.endsWith('.txt')) loader = new TextLoader(path);
          if (path.endsWith('.doc')) loader = new UnstructuredLoader(path);
          if (path.endsWith('.docx')) loader = new DocxLoader(path);
          const rawDocs = await loader.load();
          /* Split text into chunks */

          const docs = await textSplitter.splitDocuments(rawDocs);
          const characters = docs.reduce(
            (sum, doc) => sum + doc.pageContent.length,
            0,
          );

          const sourceId = uuidv4();
          const vector_ids = docs.map((_, idx) => `${sourceId}-${idx}`);
          pineconeStore.addDocuments(docs, vector_ids);

          await excuteQuery({
            query:
              'INSERT INTO sources(chatbot_id, type, content, characters, source_id, vectors) VALUES (?,?,?,?,?,?)',
            values: [
              chatbot_id,
              'FILE',
              file,
              characters,
              sourceId,
              docs.length,
            ],
          });
        });

        if (text) {
          const docs = await textSplitter.createDocuments([text]);
          const sourceId = uuidv4();
          const vector_ids = docs.map((_, idx) => `${sourceId}-${idx}`);
          pineconeStore.addDocuments(docs, vector_ids);

          await excuteQuery({
            query:
              'INSERT INTO sources(chatbot_id, type, content, characters, source_id, vectors) VALUES (?,?,?,?,?,?)',
            values: [
              chatbot_id,
              'TEXT',
              text,
              text.length,
              sourceId,
              docs.length,
            ],
          });
        }

        if (urls && Array.isArray(urls)) {
          urls.forEach(async (url) => {
            const loader = new PuppeteerWebBaseLoader(url);
            const rawDocs = await loader.load();
            /* Split text into chunks */

            const docs = await textSplitter.splitDocuments(rawDocs);
            const characters = docs.reduce(
              (sum, doc) => sum + doc.pageContent.length,
              0,
            );

            const sourceId = uuidv4();
            const vector_ids = docs.map((_, idx) => `${sourceId}-${idx}`);
            pineconeStore.addDocuments(docs, vector_ids);

            await excuteQuery({
              query:
                'INSERT INTO sources(chatbot_id, type, content, characters, source_id, vectors) VALUES (?,?,?,?,?,?)',
              values: [
                chatbot_id,
                'WEBSITE',
                url,
                characters,
                sourceId,
                docs.length,
              ],
            });
          });
        }
      } catch (error) {
        console.log('error', error);
        return res
          .status(ERROR)
          .json({ error: `Failed to train your data due to ${error}` });
      }
      try {
        const { promptTemplate, model, temperature } = DEFAULT_MODEL_CONFIG;
        const {
          visibility,
          ip_limit,
          ip_limit_message,
          ip_limit_timeframe,
          initial_messages,
        } = DEFAULT_CONFIG_VALUES;

        const chatbot: Chatbot = {
          chatbot_id,
          name,
          created_at,
          promptTemplate,
          model,
          temperature,
          visibility,
          ip_limit,
          ip_limit_message,
          ip_limit_timeframe,
          initial_messages,
          contact: DEFAULT_CONTACT_INFO,
        };

        const { chatbotIcon, profileIcon } = DEFAULT_ICONS_PATH;

        await excuteQuery({
          query:
            'INSERT INTO chatbots (chatbot_id, name, created_at, promptTemplate, model, temperature, visibility, ip_limit, ip_limit_message, ip_limit_timeframe, initial_messages, contact, chatbot_icon, profile_icon) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
          values: [
            chatbot_id,
            name,
            created_at,
            promptTemplate,
            model,
            temperature,
            visibility,
            ip_limit,
            ip_limit_message,
            ip_limit_timeframe,
            initial_messages,
            JSON.stringify(chatbot.contact),
            chatbotIcon,
            profileIcon,
          ],
        });

        await excuteQuery({
          query:
            'INSERT INTO sources (chatbot_id, type, content) VALUES (?,?,?)',
          values: [chatbot_id],
        });

        return res.status(SUCCESS).json(chatbot);
      } catch (error) {
        return res
          .status(ERROR)
          .json({ error: `Internal Server Error: due to ${error}` });
      }
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Failed to create the chatbot due to ${error}` });
    }
  } else if (req.method === 'PATCH') {
    const identifier = uuidv4();
    const prefix = 'images';
    const avatars: { chatbot?: string | null; profile?: string | null } = {};
    const form = new IncomingForm({
      uploadDir: join(process.env.ROOT_DIR || process.cwd(), `/public/images`),
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
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const chatbot: Chatbot = JSON.parse(fields.chatbot[0]) as Chatbot;
      try {
        await excuteQuery({
          query: 'UPDATE chatbots SET ? WHERE chatbot_id=(?)',
          values: [
            {
              name: chatbot.name,
              promptTemplate: chatbot.promptTemplate,
              model: chatbot.model,
              temperature: chatbot.temperature,
              visibility: chatbot.visibility,
              ip_limit: chatbot.ip_limit,
              ip_limit_message: chatbot.ip_limit_message,
              ip_limit_timeframe: chatbot.ip_limit_timeframe,
              initial_messages: chatbot.initial_messages,
              chatbot_icon: avatars.chatbot || chatbot.chatbot_icon,
              profile_icon: avatars.profile || chatbot.profile_icon,
              contact: JSON.stringify(chatbot.contact),
            },
            chatbot.chatbot_id,
          ],
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    return res.status(SUCCESS).json({ status: 'ok' });
  }
  return res.status(SUCCESS).json({ status: 'ok' });
}
