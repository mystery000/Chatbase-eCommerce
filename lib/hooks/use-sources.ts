import useSWR from 'swr';
import { Source } from '@/types/database';

import { fetcher } from '../utils';
import useChatbot from './use-chatbot';

export default function useSources() {
  const { chatbot } = useChatbot();
  const {
    data: sources,
    mutate,
    error,
    isLoading,
  } = useSWR(
    chatbot?.chatbot_id ? `/api/chatbots/${chatbot?.chatbot_id}/sources` : null,
    fetcher<Source[]>,
  );
  return { sources: (sources || []) as Source[], isLoading, mutate };
}
