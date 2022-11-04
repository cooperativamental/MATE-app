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


import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

export const CollectCall = ({ project, team, keyProject }) => {
    const db = getDatabase()

    const { connection } = useConnection()

    const [balance, setBalance] = useState()
    const [dateInvoiceOrder, setDateInvoiceOrder] = useState({
        date: "",
        status: false
    })
    const [errors, setError] = useState({
        date: true,
        percentage: true
    })

    useEffect(() => {

        get(ref(db, `projects/${keyProject}`))
            .then(async res => {
                const interval = setInterval(async () => {
                    try {
                        const bal = await connection.getBalance(new PublicKey(res.val().treasuryKey));
                        setBalance(bal)
                    } catch (e) {
                        console.error('Unknown error', e)
                    }
                }, 500)
                return () => {
                    clearInterval(interval)
                }
            })
    }, [])

    const confirmInvoice = () => {
        const invoice_call = {
            status: "COLLECT_ORDER",
            amountToInvoice: fnAmountToInvoice(),
        }
        const { textEmail, ...resObj } = invoice_call

        update(ref(db, `projects/${keyProject}`), resObj)
        //     .then(res => {

        // sendEmail({
        //     ...invoice_call.textEmail({
        //         nameProject: project.nameProject,
        //     }),
        //     from: {
        //         name: user.name,
        //         email: user.email
        //     },
        //     to: {
        //         ...Object.values(project.projectHolder)
        //             .map(values => ({
        //                 name: values.name,
        //                 email: values.email
        //             }))[0]
        //     },
        //     redirect: `${host}`
        // })

        // })
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
            <div className="flex w-full justify-between text-lg">
                <p>Project wallet: </p>
                <p>{balance}</p>
            </div>

            {/* <div className="flex justify-between text-lg w-full">
                <p>Quedara por facturar un total de: </p>
                <p>
                    {
                        project?.amountToInvoice
                            ?
                            Math.round(project?.amountToInvoice - (project?.totalBruto / project?.percentage)).toFixed(2)
                            :
                            project && Math.round(project?.totalBruto - (project?.totalBruto / project?.percentage))
                                .toLocaleString('es-ar', { minimumFractionDigits: 2 })
                    }
                </p>
            </div> */}
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />
            <div className="flex flex-col gap-4 text-lg w-full">
                <p className="text-lg font-normal">Details for invoice: </p>
                <p className="w-full bg-slate-200 p-4 rounded-md text-black">
                    {project?.descriptionInvoice}
                </p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <p className="text-normal font-bold">Share the invoice with your client</p>
                <ComponentButton
                    buttonStyle={
                        !dateInvoiceOrder?.date && dateInvoiceOrder?.status ?
                            "bg-gray" :
                            ""
                    }
                    conditionDisabled={!dateInvoiceOrder?.date && dateInvoiceOrder?.status}
                    buttonEvent={() => confirmInvoice(project?.status)}
                    buttonText="Send Invoice"
                />
            </div>
        </div>
    )
}

