import { useRouter } from 'next/router';

const Chatbot = () => {
  const router = useRouter();
  return (
    <>
      <div className="text-bold text-center">
        Chatbot {router.query.chatbot}
      </div>
    </>
  );
};

export default Chatbot;
