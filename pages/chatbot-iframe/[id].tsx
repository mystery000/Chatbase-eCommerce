import { FC } from 'react';
import dynamic from 'next/dynamic';

const ChatbotPanel = dynamic(
  () => import('@/components/chatbots/ChatbotPanel'),
);

import useChatbot from '@/lib/hooks/use-chatbot';

const SharedChatbot: FC = () => {
  const { chatbot, isLoading } = useChatbot();

  if (!chatbot || isLoading) {
    return <div className="text-center">Not Found</div>;
  }

  return (
    <>
      <ChatbotPanel chatbot={chatbot} playing={true} />
    </>
  );
};

export default SharedChatbot;
