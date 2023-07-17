import { PacmanLoader } from 'react-spinners';

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <PacmanLoader color={'#a855f7'} loading />
    </div>
  );
};

export default Loader;
