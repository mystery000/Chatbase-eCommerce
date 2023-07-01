import { FC } from 'react';
import ChatbotPanel from '@/components/chatbots/ChatbotPanel';
import useChatbot from '@/lib/hooks/use-chatbot';

const SharedChatbot: FC = () => {
  const { chatbot, mutate: mutateChatbot, isLoading } = useChatbot();

  if (!chatbot) {
    return <div className="text-center">Not Found</div>;
  }
  return (
    <>
      <ChatbotPanel chatbotId={chatbot.chatbot_id} />
    </>
  );
};

export default SharedChatbot;
