import { BAD_METHOD, BAD_REQUEST, ERROR, SUCCESS } from '@/config/HttpStatus';
import excuteQuery from '@/lib/mysql';
import { Chatbot } from '@/types/database';
import { NextApiRequest, NextApiResponse } from 'next';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/lib/pinecone/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { UnstructuredLoader } from 'langchain/document_loaders/fs/unstructured';
import { parseForm } from '@/lib/parse-form';
import requestIp from 'request-ip';
type Data = { status?: string; error?: string } | Chatbot[] | Chatbot;

const allowMethods = ['GET', 'POST'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const detectedIp = requestIp.getClientIp(req);

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
    console.log(`Notification: ${detectedIp} is creating new chatbot.`);
    try {
      const { fields, chatbot_id } = await parseForm(req);
      const name = fields.name[0];
      const created_at = new Date();
      if (!name || !chatbot_id) {
        return res.status(BAD_REQUEST).json({
          error: 'There is no chatbot name in the request body.',
        });
      }
      try {
        console.log('Loading documents...');
        /*load raw docs from the all files in the directory */
        const directoryLoader = new DirectoryLoader(
          `public/sources/${chatbot_id}`,
          {
            '.pdf': (path) => new PDFLoader(path),
            '.txt': (path) => new TextLoader(path),
            '.docx': (path) => new DocxLoader(path),
            '.doc': (path) => new UnstructuredLoader(path),
          },
        );
        // const loader = new PDFLoader(filePath);
        const rawDocs = await directoryLoader.load();
        console.log('Done!');
        /* Split text into chunks */
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const docs = await textSplitter.splitDocuments(rawDocs);
        console.log('creating vector store...');
        /*create and store the embeddings in the vectorStore*/
        const embeddings = new OpenAIEmbeddings();
        const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
        // embed the PDF documents
        await PineconeStore.fromDocuments(docs, embeddings, {
          pineconeIndex: index,
          namespace: chatbot_id,
          textKey: 'text',
        });
        console.log('created successfully.');
      } catch (error) {
        console.log('error', error);
        return res
          .status(ERROR)
          .json({ error: `Failed to train your data due to ${error}` });
      }
      try {
        await excuteQuery({
          query:
            'insert into chatbots (chatbot_id, name, created_at) values (?,?,?)',
          values: [chatbot_id, name, created_at],
        });
      } catch (error) {
        return res
          .status(ERROR)
          .json({ error: `Internal Server Error: due to ${error}` });
      }
      return res.status(SUCCESS).json({ chatbot_id, name, created_at });
    } catch (error) {
      return res
        .status(ERROR)
        .json({ error: `Failed to create the chatbot due to ${error}` });
    }
  }

  return res.status(SUCCESS).json({ status: 'ok' });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
