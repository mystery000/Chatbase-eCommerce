import '@/styles/global.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

import { SWRConfig } from 'swr';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <SWRConfig
        value={{
          dedupingInterval: 10000,
        }}
      >
        <main className={inter.variable}>
          <Component {...pageProps} />
          <Toaster position="top-center" reverseOrder={false} />
        </main>
      </SWRConfig>
    </>
  );
};

export default App;
