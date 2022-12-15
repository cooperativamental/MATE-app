import { useEffect, useState } from "react"
import { useRouter } from "next/router";

import { useAuth } from "../../context/auth";
import CurrencyConversion from "./CurrencyConversion"

import Navbar from "./Navbar";
import BottomBar from "./BottomBar"
import Withdraw from "./Withdraw";
import PopUp from "../PopUp"

import { useBalance } from "../../context/contextBalance";
import { AnimatePresence } from "framer-motion";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getDatabase, ref, get, orderByChild, query, equalTo, set, push } from "firebase/database";
import { updateDoc, query as queryFirestore, doc, arrayUnion } from "firebase/firestore";
import { PopUpProvider } from "../../context/PopUp";
import { useNotification } from '../../context/notification'
import SideBar from "./Sidebar"

import Favicon from "../Favicon";

const Layout = ({ children }) => {
  const db = getDatabase()
  const { notification } = useNotification()

  const { user, firestore } = useAuth()
  const router = useRouter()
  const { openers } = useBalance()
  const paths = ['/register', '/', '/resetPass', '/pay/[...slug]'];

  
  const existPath = paths.find(path => path === router.route.split('?')[0])
  console.log(router.route, existPath)

  const { connection } = useConnection()
  const { publicKey } = useWallet()

  useEffect(() => {
    if (!connection || !publicKey) return
    (
      async () => {
        if (user) {
          const existWallet = await get(query(ref(db, `wallet/${user?.uid}`), orderByChild("publicKey"), equalTo(publicKey.toBase58())))
          if (!existWallet.exists()) {
            set(push(ref(db, `wallet/${user.uid}`)), {
              network: "SOLANA",
              publicKey: publicKey.toBase58()
            })
          }
          updateDoc(doc(firestore, "users", user.uid), {
            wallets: arrayUnion(publicKey.toBase58())
          })
        }
      }
    )()
  }, [db, user, connection, publicKey])



  return (
    <>
      <Favicon />

      <PopUpProvider>
        <div className="flex w-full">
          {
            (user && !existPath) &&
            <SideBar />
          }
          <div className="flex flex-col w-full">
            {
              !existPath && <Navbar />
            }
            <main className={`overflow-y-auto  flex justify-center ${existPath ? "h-screen" : "h-[calc(100vh_-_3rem)]"} scrollbar`} >
              {children}
            </main>
            
          </div>
        </div>
      </PopUpProvider>
      {
        !existPath &&
        <AnimatePresence>
          {openers?.currencyConversion && <CurrencyConversion key="curencyConcersion" />}
          {openers?.withdraw && <Withdraw key="withdraw" />}
        </AnimatePresence>
      }
      {/* {
        !existPath && <BottomBar />
      } */}

    </>
  );
};

export default Layout;
