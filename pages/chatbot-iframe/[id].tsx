import { FC } from 'react';
import dynamic from 'next/dynamic';

const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
const ChatbotPanel = dynamic(
  () => import('@/components/chatbots/ChatbotPanel'),
  { loading: () => <PacmanLoader /> },
);

import useChatbot from '@/lib/hooks/use-chatbot';
import { useRouter } from 'next/router';

const SharedChatbot: FC = () => {
  const router = useRouter();
  const { chatbot, isLoading } = useChatbot();

  if (!chatbot || isLoading) {
    return <div className="text-center">Not Found</div>;
  }

  return (
    <>
      <ChatbotPanel
        chatbot={chatbot}
        playing={true}
        profileIcon={chatbot.profile_icon}
        initialMessages={chatbot.initial_messages}
      />
    </>
  );
};

export default SharedChatbot;
