import { useState, useEffect } from "react"
import { useRouter } from "next/dist/client/router";

import {
  getDatabase,
  ref,
  update,
  onValue
} from "firebase/database";
import { useAuth } from "../../../context/auth"
import ComponentButton from "../../Elements/ComponentButton";
import { useCreateWeb3 } from "../../../functions/createWeb3"
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import PopUp from "../../PopUp"


const ConfirmProject = ({ keyProject, project }) => {
  const db = getDatabase()
  const { user } = useAuth()
  const router = useRouter()
  const [ popUp, setPopUp ] = useState({
    status: false,
    title: "Titulo",
    text: "Texto",
    buttonEvent: ()=>{},
    buttonText: "Button"
  })
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
          if (res.val().partners) {
            let confirm = false
            const partners = Object.entries(res.val().partners)
            partners.forEach(([key, value]: any) => {
              if (value.status !== "CONFIRMED") {
                confirm = true;
              }
            })

            setError(prevState => {
              const newState = {
                ...prevState,
                wallet: project.projectHolder[user.uid].wallet !== publicKey?.toBase58(),
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

  useEffect(() => {
    console.log(errors)
    console.log("errr")
  }, [errors])


  const confirmProject = async () => {
    // if(!errors?.confirm){
    //   if(project.fiatOrCrypto === "CRYPTO"){
    if (project.projectHolder[user.uid].wallet === publicKey.toBase58()) {
      const walletsPartners = Object.values(project.partners).map((partner: any) => new PublicKey(partner.wallet))
      const client = Object.values(project.client).map((client: any) => {
        return new PublicKey(client?.wallet)
      })[0]
      const projectWeb3 = {
        name: project.nameProject,
        group: project.organization,
        projectType: "COMMON",
        reserve: project.ratio,
        payments: walletsPartners,
        currency: "SOL",
        amount: project.totalBruto,
        startDate: new Date(project.start).getTime(),
        endDate: new Date(project.end).getTime(),
        client: client
      }

      const respCreateProjectWeb3 = await createProject(projectWeb3)
      update(ref(db, `projects/${keyProject}`),
        {
          status: "COLLECT_PENDING",
          treasuryKey: respCreateProjectWeb3.keyTreasury.publicKey
        })
      console.log(`https://explorer.solana.com/tx/${respCreateProjectWeb3.tx}?cluster=devnet`)
      setPopUp({
        status: true,
        text: `https://explorer.solana.com/tx/${respCreateProjectWeb3.tx}?cluster=devnet`,
        title: `Created Project`,
        buttonEvent: ()=>{},
        buttonText: ""
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
    <div className="flex flex-col items-center h-min w-11/12 px-4 gap-4">
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

      <h3 className="text-xl font-bold ">Partners</h3>
      <div className="grid grid-cols-2 w-10/12 items-center gap-4">
        {
          project && project.partners &&
          Object.entries(project?.partners)?.map(([key, value]: any) => {
            return (
              <div key={key} className="flex flex-col justify-between gap-4 bg-slate-200 text-black p-4 rounded-md">
                <p className="text-lg font-semibold">{value.fullName}</p>
                <div className="flex w-full justify-between font-normal">
                  <p>Amount agreed: </p>
                  <p>{value.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex w-full justify-between font-normal">
                  <p>Partner status: </p>
                  <p>{value.status === "ANNOUNCEMENT" ? "CALLED" : value.status}</p>
                </div>
              </div>
            )
          })
        }
      </div>
      {
        !connection || !publicKey ?
          <WalletMultiButton />
          :
          <>
            <ComponentButton
              isBack={false}
              routeBack=""
              buttonText="Confirm Project"
              buttonEvent={confirmProject}
              buttonStyle={`h-14 ${errors?.confirm ? "bg-gray-500" : "bg-[#5A31E1]"}`}
              conditionDisabled={errors?.confirm || errors?.wallet}
            />
            {
              errors?.wallet &&
              <p className="text-center font-semibold">Wrong Wallet. Connect with addres: {project.projectHolder[user.uid].wallet}</p>
            }
          </>
      }
      {
        popUp.status && 
        <PopUp
          {...popUp}
        />
      }
    </div>
  )
}

export default ConfirmProject