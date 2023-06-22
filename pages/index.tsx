import Button from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const baseURL = router.pathname;

  return (
    <>
      <div className="text-bold text-center text-3xl">HOME</div>
    </>
  );
}
