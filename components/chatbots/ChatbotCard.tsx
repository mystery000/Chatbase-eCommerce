import { FC } from 'react';
import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/router';
import { Chatbot } from '@/types/database';

type ChatbotProps = {
  chatbot: Chatbot;
};

const ChatbotCard: FC<ChatbotProps> = ({ chatbot }) => {
  const router = useRouter();
  const baseURL = router.pathname;

  return (
    <Link href={`${baseURL}/${chatbot.chatbot_id}`}>
      <Card>
        <CardContent className="p-0">
          <img
            src="/chatbot.png"
            className="h-40 w-40 rounded-t-sm border-none object-cover"
            loading="lazy"
          />
        </CardContent>
        <CardFooter className="select-none p-2">
          <p className="w-8 grow truncate text-center">{chatbot.name}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ChatbotCard;
