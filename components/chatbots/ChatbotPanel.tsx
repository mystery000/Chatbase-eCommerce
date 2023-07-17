import {
  FC,
  SyntheticEvent,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { Message } from '@/types/types';
import { RefreshCw } from 'lucide-react';
import { SendIcon } from '../icons/Send';
import { chatCompletion } from '@/lib/api';
import { Chatbot, Contact } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
const AIMessage = dynamic(() => import('../message/AIMessage'));
const ClientMessage = dynamic(() => import('../message/ClientMessage'));

type ChatbotPanelProps = {
  chatbot: Chatbot;
  playing?: boolean;
  profileIcon?: string;
  initialMessages?: string;
};

const ChatbotPanel = ({
  chatbot,
  playing,
  profileIcon,
  initialMessages,
}: ChatbotPanelProps) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [messageState, setMessageState] = useState<{
    messages: Message[];
  }>({ messages: [] });

  useEffect(() => {
    setMessageState({
      messages: initialMessages
        ? initialMessages
            .replace(/\\n/g, '\n')
            .split('\n')
            .filter((message) => message.length > 0)
            .map((message) => ({ message, type: 'AIMESSAGE' }))
        : [],
    });
  }, [initialMessages]);

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

      setError('');
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
        const response = await chatCompletion(chatbot.chatbot_id, question);
        setMessageState((state) => ({
          ...state,
          messages: [
            ...state.messages,
            {
              type: 'AIMESSAGE',
              message: response.text,
            },
          ],
        }));

        setLoading(false);
        //scroll to bottom
        messageListRef.current?.scrollTo(
          0,
          messageListRef.current.scrollHeight,
        );
      } catch (err) {
        const error: Error = err as Error;
        setLoading(false);
        setError(error.message);
        toast.error(error.message);
        console.error(err);
      }
    },
    [query, chatbot, playing, messageListRef],
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

  const contact: Contact = JSON.parse(`${chatbot?.contact}`) as Contact;

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
                  loading={'lazy'}
                />
                <h1 className="text-lg font-bold text-zinc-700">
                  {contact.name.active && contact.name.label}
                </h1>
              </div>
              <button className="text-sm text-zinc-700 hover:text-zinc-600">
                <RefreshCw onClick={handleRefresh} />
              </button>
            </div>
            <div ref={messageListRef}>
              {messages.map((message, idx) =>
                message.type === 'AIMESSAGE' ? (
                  <AIMessage text={message.message} key={`${message}-${idx}`} />
                ) : (
                  <ClientMessage
                    text={message.message}
                    key={`${message}-${idx}`}
                  />
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
