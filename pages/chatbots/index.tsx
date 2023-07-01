import ChatbotCard from '@/components/chatbots/ChatbotCard';
import AppLayout from '@/components/layouts/AppLayout';
import Button from '@/components/ui/buttoneEx';
import useChatbots from '@/lib/hooks/use-chatbots';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Chatbots() {
  const router = useRouter();
  const { chatbots, loading, mutate } = useChatbots();
  const baseURL = router.pathname;

  if (loading || !chatbots) {
    return <div className="text-center text-lg">Loading...</div>;
  }

  return (
    <>
      <AppLayout>
        <div className="mx-auto mt-4 flex w-4/5 flex-col gap-12">
          <div className="flex flex-row justify-between">
            <h1 className="grow text-2xl font-extrabold text-black md:text-3xl">
              My Chatbots{' '}
              <span className="text-sm">({chatbots?.length} chatbots)</span>
            </h1>
            <Link href={`${baseURL}/create`}>
              <Button variant={'plain'} loading={false}>
                Create Chatbot
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            {chatbots?.map((chatbot) => (
              <ChatbotCard
                key={`chatbot-card-${chatbot.chatbot_id}`}
                chatbot={chatbot}
              />
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
