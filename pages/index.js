import Link from "next/link"
import Mate from "/public/mate.svg"

function App() {


  return (
    <div className='w-screen flex justify-center items-center'>
      <Link href="/login" className="flex p-4 justify-around cursor-pointer">
        <a className="flex flex-col items-center">
        <h4 className='p-8 text-xl font-layer font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#6221e8] to-[#3bb89f] animate-pulse'>
            Introducing
          </h4>
          <h1>
            <Mate className="w-72 hover:scale-125" />
          </h1>
        </a>
      </Link>
    </div>
  );
}

export default App;