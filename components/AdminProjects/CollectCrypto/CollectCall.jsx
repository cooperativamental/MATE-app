import { useState, useEffect } from "react"

import {
    getDatabase,
    ref,
    update,
    set,
    push,
    get,
    serverTimestamp

} from "firebase/database"

import ComponentButton from "../../Elements/ComponentButton"

import * as web3 from "@solana/web3.js"
import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js"
import { useHost } from "../../../context/host"
import InputSelect from "../../Elements/InputSelect"
import { useProgram } from "../../../hooks/useProgram";

export const CollectCall = ({ project, team, keyProject }) => {
    const db = getDatabase()
    const { host } = useHost()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });
    const [pda, setPda] = useState()
    const [adressThirdParties, setAdressThirdParties] = useState()

    const [dateInvoiceOrder, setDateInvoiceOrder] = useState({
        date: "",
        status: false
    })
    const [errors, setError] = useState({
        date: true,
        percentage: true
    })

    useEffect(() => {
        if (project && program) {
            const [pdaPublicKey] = web3.PublicKey.findProgramAddressSync(
                [Buffer.from("project"), Buffer.from(project.nameProject), Buffer.from(project.team)],
                program.programId,
            )
            setPda(pdaPublicKey.toString())
        }
    }, [project])

    const confirmInvoice = async () => {
        if (program) {

            const payedProject = await program?.account?.project?.fetch(pda)
            const tx = await program.rpc.useProjectTreasury(payedProject.commonExpenses
                ,
                {
                    accounts: {
                        payer: wallet.publicKey,
                        project: pda,
                        receiver: adressThirdParties,
                        systemProgram: SystemProgram.programId,
                    }
                })
            console.log(tx, pda, payedProject)
            update(ref(db, `projects/${keyProject}`), { status: "PAYED"})
        }
    }

    return (
        <div className="flex flex-col px-4 w-full">
            <h2 className="text-xl font-semibold text-center p-4">Ask for invoice</h2>
            <div className="flex font-bold justify-between text-lg w-full">
                <p>Project holder: </p>
                <p>{project?.projectHolder && Object.values(project?.projectHolder).map(val => val.name)}</p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full" />

            <div className="flex w-full justify-between font-bold text-lg">
                <p>Total: </p>
                <p>{project?.totalBruto?.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full" />
            <div className="flex w-full justify-between text-lg">
                <p>Project name: </p>
                <p>{project?.nameProject}</p>
            </div>

            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />
            <div className="flex flex-col gap-4 text-lg w-full">
                <p className="text-lg font-normal">Details for invoice: </p>
                <p className="w-full bg-slate-200 p-4 rounded-md text-black">
                    {project?.descriptionInvoice}
                </p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <p className="text-normal font-bold"></p>
                <InputSelect
                    title="Introduce public adress"
                    onChange={(e) => {
                        setAdressThirdParties(e.target.value)
                    }}
                />
                <ComponentButton
                    buttonStyle={
                        !dateInvoiceOrder?.date && dateInvoiceOrder?.status ?
                            "bg-gray" :
                            ""
                    }
                    conditionDisabled={!dateInvoiceOrder?.date && dateInvoiceOrder?.status}
                    buttonEvent={() => confirmInvoice(project?.status)}
                    buttonText="To pay"
                />
            </div>
        </div>
    )
}

