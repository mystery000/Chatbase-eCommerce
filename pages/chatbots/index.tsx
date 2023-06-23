import Button from '@/components/ui/buttoneEx';

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

export default function Chatbots() {
  const router = useRouter();
  const baseURL = router.pathname;

  return (
    <>
      <div className="mx-auto mt-4 flex w-1/2 flex-col gap-12">
        <div className="flex flex-row justify-between">
          <h1 className="grow text-center text-3xl font-bold tracking-tighter">
            My Chatbots
          </h1>
          <Link href={`${baseURL}/create`}>
            <Button variant={'plain'} loading={false}>
              Create Chatbot
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-4">
          <Link key={`project-card-${1}`} href={`${baseURL}/${1}`}>
            <Card>
              <CardContent className="p-0">
                <img src="/chatbot.png" className="rounded-t-lg" />
              </CardContent>
              <CardFooter className="select-none p-2">
                <p className="grow text-center">Chatbot1</p>
              </CardFooter>
            </Card>
          </Link>
          <Link key={`project-card-${2}`} href={`${baseURL}/${2}`}>
            <Card>
              <CardContent className="p-0">
                <img src="/chatbot.png" className="rounded-t-lg" />
              </CardContent>
              <CardFooter className="select-none p-2">
                <p className="grow text-center">Chatbot2</p>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
