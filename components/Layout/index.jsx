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

import Favicon from "../Favicon";

const Layout = ({ children }) => {
  const db = getDatabase()
  const { notification } = useNotification()

  const { user, firestore } = useAuth()
  const router = useRouter()
  const { openers } = useBalance()
  const paths = ['/login', '/register', '/', '/resetPass', '/checkout/[prjID]'];

  const existPath = paths.find(path => path === router.route.split('?')[0])

  const { connection } = useConnection()
  const { publicKey } = useWallet()

  console.log(user)

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

      {
        !existPath && <Navbar />
      }
      <PopUpProvider>
        <main className={`overflow-y-auto flex justify-center ${existPath ? "h-screen" : "h-[calc(100vh_-_3rem)]"} scrollbar`} >
          {children}
        </main>
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
