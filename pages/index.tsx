import dynamic from 'next/dynamic';
const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'), {
  loading: () => <PacmanLoader />,
});

export default function Home() {
  return (
    <>
      <AppLayout>
        <div className="text-bold text-center text-3xl text-[#22c55e]">
          HOME
        </div>
      </AppLayout>
    </>
  );
}
