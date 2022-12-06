import { useEffect } from "react"
import { useRouter } from 'next/router';
import Link from "next/link"
import { useAuth } from '../../../context/auth'
import Notification from './Notification';
// import Sidebar from "../Sidebar"
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaidIcon from '@mui/icons-material/Paid';
import FolderIcon from '@mui/icons-material/Folder';

import { ClipboardDocumentListIcon } from '@heroicons/react/20/solid'


import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { getDatabase, ref, get, set, push, query, orderByChild, equalTo } from "firebase/database";

import { useBalance } from "../../../context/contextBalance";
import useMediaQuery from "../../../hooks/useMediaQuery";

import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const Navbar = () => {
  const db = getDatabase()
  const router = useRouter()
  const isMedium = useMediaQuery("(min-width: 600px)")
  const { user } = useAuth()
  const { connection } = useConnection()
  const { publicKey } = useWallet()


  return (
    <>

      <div className="flex relative items-center justify-between bg-box-color w-full pr-[3.5rem] h-[3rem] z-10">
        {/* <div className='flex ml-4 gap-2'>
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
           <Link
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
          </Link> 
          <ClipboardDocumentListIcon
            onClick={() => {
              router.push("/projects")
            }}
            className="h-10 w-10 text-[#0d9488]" aria-hidden="true"
          />
        </div> */}



        <p className="flex absolute font-normal bg-gradient-to-r from-back-color to-blue-color rounded-r-full h-6 px-4 text-center text-md ml-10 sm:m-0">
          gm, {user?.name}
        </p>
        {
          isMedium &&
          <div className='flex absolute right-9 mr-3 gap-2'>
            <WalletMultiButton
              className="!h-6 !bg-gradient-to-r from-blue-color to-orange-color !rounded-r-none !rounded-l-full"
            >
              {
                (!publicKey || !connection) &&
                "Connect Wallet"
              }
            </WalletMultiButton>
          </div>
        }
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