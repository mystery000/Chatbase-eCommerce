import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Chatbot } from '@/types/database';
import { fetcher } from '../utils';

export default function useChatbot() {
  const router = useRouter();
  const chatbotId = router.query.id;
  const {
    data: chatbot,
    mutate,
    error,
  } = useSWR(chatbotId ? `/api/chatbots/${chatbotId}` : null, fetcher<Chatbot>);

  const loading = !chatbot && !error;
  return { loading, mutate, chatbot };
}
