import '@/styles/global.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
    </>
  );
};

export default App;
