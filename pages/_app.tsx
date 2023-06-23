import '@/styles/global.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <main className={inter.variable}>
        <Component {...pageProps} />
        <Toaster position="top-center" reverseOrder={false} />
      </main>
    </>
  );
};

export default App;
