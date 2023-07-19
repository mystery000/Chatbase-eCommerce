import { v4 as uuidv4 } from 'uuid';
import excuteQuery from '@/lib/mysql';
import { Chatbot } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { pinecone } from '@/lib/pinecone/pinecone-client';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
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
import { StateSourceType, StateSourcesType } from '@/types/types';

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

      if (!name || !chatbot_id) {
        return res.status(BAD_REQUEST).json({
          error: 'There is no chatbot name in the request body.',
        });
      }

      const hasFiles = fields?.files?.length || false;
      const hasText = fields?.text?.length || false;
      const hasWebsite = fields?.websites?.length || false;
      const hasSitemap = fields?.sitemaps?.length || false;

      const hasSources = hasFiles || hasText || hasWebsite || hasSitemap;

      if (!hasSources)
        return res.status(BAD_REQUEST).json({
          error: 'There is no provided sources',
        });

      const created_at = new Date();
      // Save embedding vectors on pinecone store and create new sources
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

        if (hasText) {
          const text = JSON.parse(fields.text[0]) as StateSourceType;
          const docs = await textSplitter.createDocuments([text.content]);
          const sourceId = uuidv4();
          const vector_ids = [];

          // generate vector ids to be saved in the Pinecone vector store.
          for (let i = 0; i < docs.length; i++)
            vector_ids.push(`${sourceId}-${i}`);

          pineconeStore.addDocuments(docs, vector_ids);

          await excuteQuery({
            query:
              'INSERT INTO sources(chatbot_id, source_id, name, type, content, characters, vectors) VALUES (?,?,?,?,?,?,?)',
            values: [
              chatbot_id,
              sourceId,
              text.name,
              text.type,
              text.content,
              text.characters,
              vector_ids.length,
            ],
          });
        }
        if (hasFiles) {
          if (Array.isArray(fields.files)) {
            fields.files.forEach(async (data) => {
              const file = JSON.parse(data) as StateSourceType;
              const docs = await textSplitter.createDocuments([file.content]);
              const sourceId = uuidv4();
              const vector_ids = [];

              // generate vector ids to be saved in the Pinecone vector store.
              for (let i = 0; i < docs.length; i++)
                vector_ids.push(`${sourceId}-${i}`);

              pineconeStore.addDocuments(docs, vector_ids);

              await excuteQuery({
                query:
                  'INSERT INTO sources(chatbot_id, source_id, name, type, content, characters, vectors) VALUES (?,?,?,?,?,?,?)',
                values: [
                  chatbot_id,
                  sourceId,
                  file.name,
                  file.type,
                  'Load more....',
                  file.characters,
                  vector_ids.length,
                ],
              });
            });
          }
        }
        if (hasWebsite) {
          if (Array.isArray(fields.websites)) {
            fields.websites.forEach(async (data) => {
              const website = JSON.parse(data) as StateSourceType;
              const docs = await textSplitter.createDocuments([
                website.content,
              ]);
              const sourceId = uuidv4();
              const vector_ids = [];

              // generate vector ids to be saved in the Pinecone vector store.
              for (let i = 0; i < docs.length; i++)
                vector_ids.push(`${sourceId}-${i}`);

              pineconeStore.addDocuments(docs, vector_ids);

              await excuteQuery({
                query:
                  'INSERT INTO sources(chatbot_id, source_id, name, type, content, characters, vectors) VALUES (?,?,?,?,?,?,?)',
                values: [
                  chatbot_id,
                  sourceId,
                  website.name,
                  website.type,
                  'Load more....',
                  website.characters,
                  vector_ids.length,
                ],
              });
            });
          }
        }
        if (hasSitemap) {
          if (Array.isArray(fields.sitemaps)) {
            fields.sitemaps.forEach(async (data) => {
              const sitemap = JSON.parse(data) as StateSourceType;
              const docs = await textSplitter.createDocuments([
                sitemap.content,
              ]);
              const sourceId = uuidv4();
              const vector_ids = [];

              // generate vector ids to be saved in the Pinecone vector store.
              for (let i = 0; i < docs.length; i++)
                vector_ids.push(`${sourceId}-${i}`);

              pineconeStore.addDocuments(docs, vector_ids);

              await excuteQuery({
                query:
                  'INSERT INTO sources(chatbot_id, source_id, name, type, content, characters, vectors) VALUES (?,?,?,?,?,?,?)',
                values: [
                  chatbot_id,
                  sourceId,
                  sitemap.name,
                  sitemap.type,
                  'Load more....',
                  sitemap.characters,
                  vector_ids.length,
                ],
              });
            });
          }
        }
      } catch (error) {
        console.log('error', error);
        return res
          .status(ERROR)
          .json({ error: `Failed to train your data due to ${error}` });
      }
      // Create new Chatbot
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
          active_profile_icon: true,
        };

        const { chatbotIcon, profileIcon } = DEFAULT_ICONS_PATH;

        await excuteQuery({
          query:
            'INSERT INTO chatbots (chatbot_id, name, created_at, promptTemplate, model, temperature, visibility, ip_limit, ip_limit_message, ip_limit_timeframe, initial_messages, contact, chatbot_icon, profile_icon, active_profile_icon) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
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
            true,
          ],
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
              active_profile_icon: chatbot.active_profile_icon,
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
