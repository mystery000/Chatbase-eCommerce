import { Chatbot } from '@/types/database';
import { getResponseOrThrow } from './utils';

interface SwissFile extends File {
  type: string;
}

export const createChatbot = async (
  name: string,
  documents: File[],
  text: string,
  urls: string[],
) => {
  const payload = new FormData();
  payload.append('name', name);
  payload.append('text', text);
  urls.map((url) => payload.append('urls', url));
  documents.forEach((document) => payload.append('documents', document));

  const res = await fetch('/api/chatbots', {
    method: 'POST',
    body: payload,
  });
  return getResponseOrThrow<Chatbot>(res);
};

export const deleteChatbot = async (chatbotId: string) => {
  const res = await fetch(`/api/chatbots/${chatbotId}`, {
    method: 'DELETE',
  });
  return getResponseOrThrow<any>(res);
};

export const chatCompletion = async (chatbotId: string, question: string) => {
  const res = await fetch(`/api/chatbots/${chatbotId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ question }),
  });
  return getResponseOrThrow<any>(res);
};

export const updateChatbotSettings = async (
  chatbot: Chatbot,
  avatars?: { profile?: File; chatbot?: File },
) => {
  const payload = new FormData();
  payload.append('chatbot', JSON.stringify(chatbot));
  avatars?.chatbot && payload.append('avatar_chatbot', avatars.chatbot);
  avatars?.profile && payload.append('avatar_profile', avatars.profile);

  const res = await fetch(`/api/chatbots`, {
    method: 'PATCH',
    body: payload,
  });

  return getResponseOrThrow<any>(res);
};
