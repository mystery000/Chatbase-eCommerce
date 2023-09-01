import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Chatbot } from '@/types/database';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

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
          <Image
            src={`/${chatbot?.chatbot_icon}`}
            className="h-44 w-44 rounded-t-sm border-none object-cover"
            loading="lazy"
            width={156}
            height={156}
            alt="Icon of the chatbot"
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
