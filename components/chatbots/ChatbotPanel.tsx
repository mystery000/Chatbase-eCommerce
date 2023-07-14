import {
  FC,
  SyntheticEvent,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SendIcon } from '../icons/Send';
import AIMessage from '../message/AIMessage';
import ClientMessage from '../message/ClientMessage';
import { Message } from '@/types/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

type ChatbotPanelProps = {
  chatbotId: string;
  playing?: boolean;
  profileIcon?: string;
};

const ChatbotPanel = ({
  chatbotId,
  playing,
  profileIcon,
}: ChatbotPanelProps) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
  }>({
    messages: [{ message: 'Hi! What can I do for you?', type: 'AIMESSAGE' }],
  });

  const { messages } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!playing) return;
    inputBoxRef.current?.focus();
  }, [playing]);

  const submitPrompt = useCallback(
    async (e: SyntheticEvent<EventTarget>) => {
      e.preventDefault();

      if (!playing) return;

      setError(null);
      if (!query) {
        toast.error('Please input a question');
        return;
      }
      const question = query.trim();
      setMessageState((state) => ({
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'CLIENTMESSAGE',
            message: question,
          },
        ],
      }));
      setLoading(true);
      setQuery('');

      try {
        const response = await fetch(`/api/chatbots/${chatbotId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question }),
        });
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: 'AIMESSAGE',
                message: data.text,
              },
            ],
          }));
        }
        setLoading(false);
        //scroll to bottom
        messageListRef.current?.scrollTo(
          0,
          messageListRef.current.scrollHeight,
        );
      } catch (error) {
        setLoading(false);
        setError('Failed to chat with AI. Please try again.');
        toast.error('Failed to chat with AI. Please try again.');
        console.log('error', error);
      }
    },
    [query, chatbotId, playing],
  );

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      submitPrompt(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const handleRefresh = useCallback(() => {
    if (playing) setMessageState({ messages: [] });
  }, [playing]);

  return (
    <Card>
      <CardContent>
        <div className=" flex h-[42rem] flex-col justify-between overflow-auto rounded">
          <div>
            <div className="mb-4 flex justify-between border-b bg-white py-2">
              <div className="flex items-center">
                <img
                  className="m-1 rounded-full"
                  alt="profile picture"
                  width={36}
                  height={36}
                  src={profileIcon}
                />
                <h1 className="text-lg font-bold text-zinc-700">Mohamed</h1>
              </div>
              <button className="text-sm text-zinc-700 hover:text-zinc-600">
                <RefreshCw onClick={handleRefresh} />
              </button>
            </div>
            <div ref={messageListRef}>
              {messages.map((message) =>
                message.type === 'AIMESSAGE' ? (
                  <AIMessage text={message.message} />
                ) : (
                  <ClientMessage text={message.message} />
                ),
              )}
            </div>
          </div>
          <div>
            <form onSubmit={submitPrompt}>
              <div
                className="flex rounded p-1 pl-3"
                style={{ background: 'white', border: '1px solid #e4e4e7' }}
              >
                <input
                  ref={inputBoxRef}
                  type="text"
                  aria-label="chat input"
                  required
                  disabled={loading}
                  maxLength={512}
                  className="min-w-0 flex-auto appearance-none rounded-md bg-white text-gray-900 focus:outline-none sm:text-sm"
                  placeholder={
                    loading
                      ? 'Waiting for response...'
                      : 'What is your question?'
                  }
                  onKeyDown={handleEnter}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="flex-none p-2"
                  disabled={loading}
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotPanel;
