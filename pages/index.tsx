import NavbarLayout from '@/components/NavbarLayout';

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <NavbarLayout>
        <div className="text-bold text-center text-3xl">HOME</div>
      </NavbarLayout>
    </>
  );
}
