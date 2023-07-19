import { Chatbot } from '@/types/database';
import { getResponseOrThrow } from './utils';
import { StateSourcesType } from '@/types/types';

export const createChatbot = async (
  name: string,
  sources: StateSourcesType,
) => {
  const payload = new FormData();
  payload.append('name', name);
  if (sources.text) payload.append('text', JSON.stringify(sources.text));
  if (sources.files?.length) {
    sources.files.map((file) => payload.append('files', JSON.stringify(file)));
  }
  if (sources.websites?.length) {
    sources.websites.map((website) =>
      payload.append('websites', JSON.stringify(website)),
    );
  }
  if (sources.sitemaps?.length) {
    sources.sitemaps.map((sitemap) =>
      payload.append('sitemaps', JSON.stringify(sitemap)),
    );
  }
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
