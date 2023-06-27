import React, { FC } from 'react';
import ReactMarkdown from 'react-markdown';

type AIMessageProps = {
  text: string;
};

const AIMessage: FC<AIMessageProps> = ({ text }) => {
  return (
    <div className="mr-8 flex justify-start">
      <div className="mb-3 overflow-auto rounded-lg  bg-gray-100 px-4 py-3 text-black">
        <div className=" flex flex-col items-start gap-4 break-words">
          <div className="prose dark:prose-invert w-full break-words text-left text-inherit ">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMessage;
