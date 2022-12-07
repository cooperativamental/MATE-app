import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/dist/client/router";

import {
  getDatabase,
  ref,
  update,
  onValue
} from "firebase/database";
import { useAuth } from "../../../context/auth"
import ComponentButton from "../../Elements/ComponentButton";

import * as anchor from "@project-serum/anchor";
import { useCreateWeb3 } from "../../../functions/createWeb3"
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { usePopUp } from "../../../context/PopUp"


const ConfirmProject = ({ keyProject, project }) => {
  const db = getDatabase()
  const { user } = useAuth()
  const router = useRouter()
  const { handlePopUp } = usePopUp()
  const [errors, setError] = useState({
    wallet: false,
    confirm: false
  })

  const { createProject } = useCreateWeb3()

  const { connection } = useConnection()
  const { publicKey } = useWallet()

  useEffect(() => {
    if (keyProject && user) {

      const unsubscribe = onValue(ref(db, `projects/${keyProject}`), res => {
        if (res.hasChildren()) {
          let confirm = false
          if (res.val().partners) {
            const partners = Object.entries(res.val().partners)
            partners.forEach(([key, value]: any) => {
              if (value.status !== "CONFIRMED") {
                confirm = true;
              }
            })

            setError(prevState => {
              const newState = {
                ...prevState,
                wallet: project?.projectHolder?.[user.uid]?.wallet !== publicKey?.toBase58(),
                confirm
              }
              return newState
            })
          }
        }
      })
      return () => {
        unsubscribe()
      }
    }
  }, [db, user, keyProject, publicKey])


  const confirmProject = async () => {
    // if(!errors?.confirm){
    //   if(project.fiatOrCrypto === "CRYPTO"){
    if (project.projectHolder[user.uid].wallet === publicKey.toBase58()) {
      const walletsPartners = Object.values(project.partners).map((partner: any) => {
        return (
          {
            member: new PublicKey(partner.wallet),
            amount: new anchor.BN((partner.amount * LAMPORTS_PER_SOL))
          }
        )
      }
      )
      const client = Object.values(project.client).map((client: any) => {
        return new PublicKey(client?.wallet)
      })[0]
      const projectWeb3 = {
        name: project.nameProject,
        group: project.team,
        projectType: "COMMON",
        reserve: project.ratio,
        payments: walletsPartners,
        currency: "LAMPORT",
        amount: project.totalBruto * LAMPORTS_PER_SOL,
        startDate: new Date(project.start).getTime(),
        endDate: new Date(project.end).getTime(),
        client: client
      }

      const respCreateProjectWeb3 = await createProject(projectWeb3)
      update(ref(db, `projects/${keyProject}`),
        {
          status: "INVOICE_PENDING",
          
          treasuryKey: respCreateProjectWeb3.keyTreasury
        })
      console.log(`https://explorer.solana.com/tx/${respCreateProjectWeb3.tx}?cluster=devnet`)
      handlePopUp({
        text:
          <div className="">
            <p>View on Explorer</p>
            <Link
              href={`https://explorer.solana.com/tx/${respCreateProjectWeb3.tx}?cluster=devnet`}
            >
              <a
                target="_blank"
                className="flex w-8/12 font-semibold text-xl overflow-hidden text-clip">
                {`https://explorer.solana.com/tx/${respCreateProjectWeb3.tx}?cluster=devnet`}
              </a>
            </Link>
          </div>
        ,
        title: `Project Confirmed & Signed`,
      })
    }
    // router.push(router.pathname)
    // } else {
    //   update(ref(db, `projects/${keyProject}`), {status: "INVOICE_PENDING"})
    //   router.push(router.pathname)
    // }

    // }
  };


  return (
    <div className="flex flex-col items-center h-min w-11/12 px-4 gap-4 mt-12">
      <div className="flex text-2xl font-bold justify-between w-full gap-4">
        <p>Net Budget: </p>
        <p>
          {project?.totalNeto
            .toLocaleString('es-ar', { minimumFractionDigits: 2 })}
        </p>
      </div>
      <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />

      <div className="flex text-xl font-semibold justify-between w-full gap-4">
        <p className="">Third parties costs</p>
        <p>{project?.thirdParties.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
      </div>
      <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />

      <h3 className="text-xl font-bold ">Project partners</h3>
      <div className="grid w-full items-center gap-4">
        {
          project && project.partners &&
          Object.entries(project?.partners)?.map(([key, value]: any) => {
            return (
              <div key={key} className="flex flex-col justify-between gap-4 bg-slate-500 text-black p-4 rounded-md">
                <p className="text-lg font-semibold">{value.name}</p>
                <div className="flex w-full justify-between font-normal">
                  <p>Amount agreed: </p>
                  <p>{value.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex w-full justify-between font-normal">
                  <p>Status: </p>
                  <p>{value.status === "ANNOUNCEMENT" ? "CALLED" : value.status}</p>
                </div>
              </div>
            )
          })
        }
      </div>
      {
        !connection || !publicKey ?
          <WalletMultiButton>Connect Wallet</WalletMultiButton>
          :
          <>
            <ComponentButton
              btn2={false}
              btn3={false}
              isBack={false}
              routeBack=""
              buttonText="Confirm & Sign Project"
              buttonEvent={confirmProject}
              buttonStyle=""
              conditionDisabled={errors?.confirm || errors?.wallet}
            />
            {
              errors?.wallet &&
              <p className="text-center font-semibold">Wrong Wallet. Connect with address: {project?.projectHolder?.[user.uid]?.wallet}</p>
            }
          </>
      }
    </div>
  )
}

export default ConfirmProject