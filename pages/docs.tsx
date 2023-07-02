import dynamic from 'next/dynamic';
const AppLayout = dynamic(() => import('@/components/layouts/AppLayout'));

export default function Docs() {
  return (
    <>
      <AppLayout>
        <div className="text-bold text-center text-3xl text-[#22c55e]">API</div>
      </AppLayout>
    </>
  );
}
