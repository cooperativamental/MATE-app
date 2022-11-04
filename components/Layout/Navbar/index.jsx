import { useEffect } from "react"
import { useRouter } from 'next/router';
import Link from "next/link"
import { useAuth } from '../../../context/auth'
import Notification from './Notification';
import Sidebar from "./Sidebar"
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import FolderIcon from '@mui/icons-material/Folder';

import { ClipboardDocumentListIcon } from '@heroicons/react/20/solid'


import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { getDatabase, ref, get, set, push, query, orderByChild, equalTo } from "firebase/database";

import { useBalance } from "../../../context/contextBalance";


const Navbar = () => {
  const db = getDatabase()
  const router = useRouter()
  const { handleOpeners } = useBalance()
  const { user } = useAuth()

  return (
    <>
      <Sidebar />
      <div className="flex relative items-center justify-between w-full px-[3.5rem] h-[3rem] z-10">
        <div className='flex ml-4 gap-2'>
          <Link href="/teams" >
            <a
              className='flex justify-center items-center'
              title="Teams"
            >

              <GroupWorkIcon
                style={{ color: "#0d9488" }}
                sx={{ fontSize: 40 }}
              />
            </a>
          </Link>
          {/* <Link
            href={{
              pathname: "/projects",

            }}
            passHref
          >
            <a
              className='flex justify-center items-center'
              title="Admin Projects"
            >
              <FolderIcon
                style={{ color: "#0d9488" }}
                sx={{ fontSize: 40 }}
              />
            </a>
          </Link> */}
          <ClipboardDocumentListIcon
            onClick={() => {
              router.push("/projects")
            }}
            className="h-10 w-10 text-[#0d9488]" aria-hidden="true"
          />
        </div>


        <div className='flex mr-4 gap-2'>
          <WalletMultiButton>Connect Wallet</WalletMultiButton>
        </div>
        <p
          className="flex absolute left-1/2 -translate-x-[50%] h-full text-center text-lg font-semibold p-4"
        >
          gm, {user?.userName}
        </p>


      </div>
      {
        user ?
          <Notification />
          :
          null
      }
    </>
  )
}

export default Navbar