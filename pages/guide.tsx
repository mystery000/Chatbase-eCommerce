import dynamic from 'next/dynamic';
const PacmanLoader = dynamic(() => import('@/components/loaders/PacmanLoader'));
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'), {
  loading: () => <PacmanLoader />,
});

export default function Guide() {
  return (
    <>
      <AppLayout>
        <div className="text-bold flex flex-col text-center text-3xl text-[#22c55e]">
          GUIDE
        </div>
      </AppLayout>
    </>
  );
}
