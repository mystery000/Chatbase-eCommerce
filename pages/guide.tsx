import AppLayout from '@/components/layouts/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Guide() {
  const router = useRouter();

  return (
    <>
      <AppLayout>
        <div className="text-bold text-center text-3xl text-[#22c55e]">
          GUIDE
        </div>
      </AppLayout>
    </>
  );
}
