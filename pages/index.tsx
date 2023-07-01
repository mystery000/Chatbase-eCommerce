import AppLayout from '@/components/layouts/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <AppLayout>
        <div className="text-bold text-center text-3xl">HOME</div>
      </AppLayout>
    </>
  );
}
