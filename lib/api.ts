import { Chatbot } from '@/types/database';
import { getResponseOrThrow } from './utils';

export const createChatbot = async (name: string, documents: File[]) => {
  const payload = new FormData();
  payload.append('name', name);
  documents.forEach((document) => payload.append('documents', document));

  const res = await fetch('/api/chatbots', {
    method: 'POST',
    body: payload,
  });
  return getResponseOrThrow<Chatbot>(res);
};
