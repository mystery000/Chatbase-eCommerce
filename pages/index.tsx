import Button from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <div className="flex w-1/2 flex-col">
        <div className="flex flex-row justify-between">
          <h1 className="text-center text-2xl font-bold tracking-tighter">
            My Chatbots
          </h1>
          <Button variant={'plain'} loading={false}>
            Upload
          </Button>
        </div>
        <div></div>
      </div>
    </>
  );
}
