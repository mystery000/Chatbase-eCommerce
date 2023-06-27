import { FC } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

type ClientMessageProps = {
  text: string;
};

const ClientMessage: FC<ClientMessageProps> = ({ text }) => {
  return (
    <div className="ml-8 flex justify-end">
      <div className="dark mb-3 overflow-auto  rounded-lg bg-blue-500 px-4 py-3 text-white">
        <div className=" flex flex-col items-start gap-4 break-words">
          <div className="prose dark:prose-invert w-full break-words text-left text-inherit ">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessage;
