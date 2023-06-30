import '@/styles/global.css';
import { Inter } from 'next/font/google';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';

import { SWRConfig } from 'swr';
import { ManagedConfigContext } from '@/lib/context/config';

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
        <ManagedConfigContext>
          <main className={inter.variable}>
            <Component {...pageProps} />
            <Toaster position="top-center" reverseOrder={false} />
          </main>
        </ManagedConfigContext>
      </SWRConfig>
    </>
  );
};

export default App;
