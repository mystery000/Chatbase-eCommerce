import excuteQuery from '@/lib/mysql';
import { Chatbot, Source } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { pinecone } from '@/lib/pinecone/pinecone-client';
import { StateSourceType, StateSourcesType } from '@/types/types';
import { BAD_METHOD, BAD_REQUEST, ERROR, SUCCESS } from '@/config/HttpStatus';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

type Data = { status?: string; error?: string } | Source[] | Source;

const allowMethods = ['GET', 'POST', 'PATCH'];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1024mb', // Set desired value here
    },
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
  } else if (req.method === 'PATCH') {
    if (!chatbotId) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'Invalid request: chatbot id is missing now.' });
    }
    const { data }: { data: StateSourcesType } = JSON.parse(req.body);

    let sources: StateSourceType[] = [];
    data.files?.forEach((file) => sources.push(file));
    data.websites?.forEach((website) => sources.push(website));
    data.sitemaps?.forEach((sitemap) => sources.push(sitemap));
    if (data.text) sources.push(data.text);

    if (!sources) {
      return res
        .status(BAD_REQUEST)
        .json({ error: 'Invalid request: sources parameter is missing now.' });
    }
    try {
      const DBSources = ((await excuteQuery({
        query: 'SELECT * FROM sources WHERE chatbot_id=(?)',
        values: [chatbotId],
      })) || []) as Source[];

      const db_source_ids: string[] =
        DBSources.map((source) => source.source_id) || [];
      for (const source of sources) {
        if (!db_source_ids.includes(source.key)) {
          // Store all vectors on Pinecone
          const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
          });

          /* create and store the embeddings in the vectorStore */
          const embeddings = new OpenAIEmbeddings();
          const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

          // embed the PDF documents
          const pineconeStore = new PineconeStore(embeddings, {
            pineconeIndex: index,
            namespace: chatbotId,
            textKey: 'text',
          });

          const docs = await textSplitter.createDocuments([source.content]);

          const vectorIds = Array.from(
            { length: docs.length },
            (_, i) => `${source.key}-${i}`,
          );

          pineconeStore.addDocuments(docs, vectorIds);

          // Insert source on database
          await excuteQuery({
            query:
              'INSERT INTO sources(chatbot_id, source_id, name, type, content, characters, vectors) VALUES (?,?,?,?,?,?,?)',
            values: [
              chatbotId,
              source.key,
              source.name,
              source.type,
              source.type === 'TEXT' ? source.content : 'Load more',
              source.characters,
              vectorIds.length,
            ],
          });
        }
      }

      const state_source_ids: string[] =
        sources.map((source) => source.key) || [];
      for (const source of DBSources) {
        if (!state_source_ids.includes(source.source_id)) {
          // Delete vectors of this source from pinecone
          const index = pinecone.Index(PINECONE_INDEX_NAME);

          const vectorIds = Array.from(
            { length: source.vectors },
            (_, i) => `${source.source_id}-${i}`,
          );

          for (let i = 0; i < vectorIds.length; i += 1000) {
            await index.delete1({
              ids: vectorIds.slice(i, i + 1000),
              namespace: chatbotId,
            });
          }

          // Delete source from database
          await excuteQuery({
            query: 'DELETE FROM sources WHERE chatbot_id=(?) and source_id=(?)',
            values: [chatbotId, source.source_id],
          });
        }
      }
      return res.status(200).json({ status: 'OK' });
    } catch (error) {
      console.log(error);
      return res
        .status(ERROR)
        .json({ error: `Internal Server Error: due to ${error}` });
    }
  }

  return res.status(SUCCESS).json({ status: 'ok' });
}
