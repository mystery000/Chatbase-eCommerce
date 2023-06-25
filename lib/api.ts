import { Chatbot } from '@/types/database';
import { getResponseOrThrow } from './utils';

export const createChatbot = async (name: string) => {
  const res = await fetch('/api/chatbots', {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return getResponseOrThrow<Chatbot>(res);
};
