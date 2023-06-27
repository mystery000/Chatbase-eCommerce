import useSWR from 'swr';
import { fetcher } from '../utils';
import { Chatbot } from '@/types/database';

export default function useChatbots() {
  const {
    data: chatbots,
    mutate,
    error,
  } = useSWR('/api/chatbots', fetcher<Chatbot[]>);

  const loading = !chatbots && !error;
  return { loading, chatbots, mutate };
}
