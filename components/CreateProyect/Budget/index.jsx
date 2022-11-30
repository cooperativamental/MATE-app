import { Component, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getDatabase, ref, get, orderByChild, query, equalTo, onValue } from "firebase/database";

import { MultiSelect } from '../../MultiSelect'
import { useAuth } from "../../../context/auth";

import InputSelect from "../../Elements/InputSelect";
import ComponentButton from "../../Elements/ComponentButton";

import { where, getDocs, collection, query as queryFirestore } from "firebase/firestore";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../../../hooks/useProgram/index.ts"
import { PublicKey } from "@solana/web3.js";


const Budget = ({ setProject, project, confirmInfoProject, available, errors, confirmation }) => {
    const db = getDatabase()
    const router = useRouter()
    const { user, firestore } = useAuth()
    const [reserve, setReserve] = useState(0)

    // const [project, setProject] = useState({
    //     totalNeto: 0,
    //     totalBruto: 0,
    //     thirdParties: { amount: 0 },
    //     partners: {},
    // })
    const [teams, setTeams] = useState()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    useEffect(() => {
        if (program?.account?.group && user) {
            (async () => {
                const resTeamsWeb3 = await program?.account?.group.all()
                const findTeam = resTeamsWeb3?.find(team => team.account.name === router.query.team)
                setTeams(findTeam.account)
            })()
        }
    }, [db, user, firestore, program?.account?.group, router.query.team, project.fiatOrCrypto])

    useEffect(() => {
        setReserve((project?.ratio * (project?.totalNeto - project?.thirdParties?.amount)) / 100)
    }, [project.totalNeto, project.thirdParties, project.partners, project.ratio])


    const handleBudgetProject = (e, data) => {
        const value = Number(e.target.value)
        if (e.target.name === "thirdParties") {
            setProject({
                ...project,
                [e.target.name]: { amount: value },
                partners: {
                    ...project.partners,
                    [user.uid]: {
                        ...project.partners[user.uid],
                        amount: 0,
                        percentage: 0
                    }
                }
            })
        } else if (e.target.name === "totalNeto") {
            setProject({
                ...project,
                [e.target.name]: value,
                totalBruto: Number((value + value * ((teams.ratio) / 10000)).toFixed(3)),
                partners: {
                    ...project.partners,
                    [user.uid]: {
                        ...project.partners[user.uid],
                        amount: 0,
                        percentage: 0
                    }
                }
            })
        } else if (e.target.name === "totalBruto") {
            setProject({
                ...project,
                [e.target.name]: value,
                totalNeto: Number((value - value * ((teams.ratio) / 10000)).toFixed(3)),
                partners: {
                    ...project.partners,
                    [user.uid]: {
                        ...project.partners[user.uid],
                        amount: 0,
                        percentage: 0
                    }
                }
            })
        } else if (e.target.name === "ratio") {
            if (value > 100) {
                setProject({
                    ...project,
                    [e.target.name]: 100,
                    // totalNeto: !!value ? (project.totalNeto - (project.totalNeto * (value / 100))) : project.totalNeto
                    partners: {
                        ...project.partners,
                        [user.uid]: {
                            ...project.partners[user.uid],
                            amount: 0,
                            percentage: 0
                        }
                    }
                })
            } else {

                confirmInfoProject("ASSEMBLE_TEAM", false)
                setProject({
                    ...project,
                    [e.target.name]: value,
                    // totalNeto: !!value ? (project.totalNeto - (project.totalNeto * (value / 100))) : project.totalNeto
                    partners: {
                        ...project.partners,
                        [user.uid]: {
                            ...project.partners[user.uid],
                            amount: 0,
                            percentage: 0
                        }
                    }
                })
            }
        }
    }

    const handleConfirm = () => {
        confirmInfoProject("BUDGET", true)
    }

    return (
        <div className="flex flex-col w-8/12 items-center gap-3">
            <div className="flex flex-col w-full " >
                <div className="flex flex-row gap-2 w-full items-center  ">
                    {/* <h4>{currency}</h4> */}
                    <InputSelect
                        inputStyle={`flex appearance-none border text-center rounded-xl w-full h-16 text-xl pl-4 placeholder-slate-100 ${errors?.totalNeto ? " border border-red-600 " : null} `}
                        placeholder="Project's Budget ◎"
                        value={!!project?.totalBruto && project?.totalBruto?.toString()}
                        type="number"
                        name="totalBruto"
                        onChange={(e) => handleBudgetProject(e)}
                        min={0}

                    />
                </div>
                <p className="text-xs text-gray-100 text-center">Invoice total amount without VAT</p>
            </div>

            <div className="flex flex-col w-full" >
                <div className=" flex flex-row gap-2 items-center w-full">
                    {/* <h4>{currency}</h4> */}
                    <InputSelect
                        inputStyle={`flex appearance-none border text-center rounded-xl w-full h-16 text-xl pl-4 placeholder-slate-100 ${errors?.totalNeto ? " border border-red-600 " : null} `}
                        placeholder="Net budget ◎"
                        value={!!project?.totalNeto && project?.totalNeto?.toString()}
                        name="totalNeto"
                        onChange={(e) => handleBudgetProject(e)}
                        type="number"
                        min={0}

                    />
                </div>
                <p className=" text-xs text-gray-100 text-center">Amount after invoicing taxes and team´s treasury ratio</p>
            </div>

            <div className="flex flex-col w-full" >
                <div className=" flex flex-row gap-2 items-center w-full">
                    {/* <h4>{currency}</h4> */}
                    <InputSelect
                        inputStyle={`flex appearance-none border rounded-xl w-full h-16 text-center text-xl pl-4 placeholder-slate-100 ${errors?.thirdParties ? " border border-red-600 " : null} `}
                        placeholder={`Third parties budget ◎`}
                        value={!!project?.thirdParties?.amount && project?.thirdParties?.amount.toString()}
                        name="thirdParties"
                        onChange={(e) => handleBudgetProject(e)}
                        type="number"
                        min={0}
                    />
                </div>
                <p className=" text-xs text-gray-100 text-center">Third party expenses, not members of your team.</p>
            </div>
            
            <hr className="flex bg-slate-300 border-[1px] w-full" />
            <div className="flex flex-col w-full" >
                <div className=" flex flex-row gap-2 items-center w-full">
                    <InputSelect
                        inputStyle={`flex appearance-none border rounded-xl text-center w-full h-16 text-xl pl-4 placeholder-slate-100 ${errors?.thirdParties ? " border border-red-600 " : null} `}
                        placeholder={`Reserve %`}
                        title="Reserve %"
                        value={!!project?.ratio && project?.ratio.toString()}
                        name="ratio"
                        onChange={(e) => handleBudgetProject(e)}
                        type="number"
                        min={0}
                        max={100}
                    />
                </div>
                <div className=" flex flex-row gap-2 items-center w-full">
                    <InputSelect
                        inputStyle={`flex appearance-none border rounded-xl text-center w-full h-16 text-xl pl-4 placeholder-slate-100 ${errors?.thirdParties ? " border border-red-600 " : null} `}
                        placeholder={`Reserve %`}
                        title="Reserve %"
                        value={reserve}
                        disabled
                    />
                </div>
                <p className=" text-xs text-gray-100 text-center">Reserve for extraordinary expenses, final clearing, budget deviations, etc.</p>
            </div>
            <ComponentButton
                buttonEvent={handleConfirm}
                buttonText="Confirm Budget"
                conditionDisabled={available < 0 || errors.thirdParties}
            />
        </div>
    )
}

export default Budget

