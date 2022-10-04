import Link from "next/link"

function App() {


  return (
    <div className='w-screen flex justify-center items-center animate-pulse'>
      <Link href="/login" className="flex p-4 justify-around cursor-pointer">
        <a className="flex flex-col items-center">
        <h4 className='text-xl font-layer font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#6221e8] to-[#3bb89f]'>
            Introducing
          </h4>
          <h1 className='text-7xl font-layer font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#6221e8] to-[#3bb89f]'>
            Mate
          </h1>
        </a>
      </Link>
    </div>
  );
}

export default App;