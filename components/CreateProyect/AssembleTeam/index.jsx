import { useEffect, useState } from "react"
import { useRouter } from "next/router"


import ComponentButton from "../../Elements/ComponentButton"
import InputSelect from "../../Elements/InputSelect"
import { MultiSelect } from "../../MultiSelect"

import { getDatabase, ref, get, orderByChild, query, equalTo, onValue } from "firebase/database";
import { where, getDocs, collection, query as queryFirestore } from "firebase/firestore";

import { useAuth } from "../../../context/auth";

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "../../../hooks/useProgram/index.ts"

const AssembleTeam = ({ project, setProject, confirmInfoProject, available, errors, confirmation }) => {
    const db = getDatabase()
    const router = useRouter()
    const { user, firestore } = useAuth()

    const [assembleTeam, setAssembleTeam] = useState()
    const [partners, setPartners] = useState()
    const [selectPartners, setSelectPartners] = useState()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    useEffect(() => {
        if (program?.account?.group && user) {
            (async () => {
                const resTeamsWeb3 = await program?.account?.group.all()
                const findTeam = resTeamsWeb3?.find(team => team.account.name === router.query.team) 
                getDocs(queryFirestore(collection(firestore, 'users'), where("team", "array-contains", router.query.team)))
                    .then((resUsers) => {
                        let listUsers = {}
                        resUsers.forEach(user => {
                            listUsers = {
                                ...listUsers,
                                [user.id]: {
                                    ...user.data(),
                                    name: user.data().name
                                }
                            }
                        })
                        setPartners(listUsers)
                        setSelectPartners({
                            ...selectPartners,
                            [user.uid]: listUsers[user.uid]
                        })
                    })
                get(query(ref(db, `wallet/${user?.uid}`)))
                    .then(res => {
                        const convertWalletsInTeam = findTeam.account.members.map(member => member.toBase58())
                        const filterWalletInTeam = Object.values(res.val()).filter((wallet) => {
                            return convertWalletsInTeam.includes(wallet.publicKey)
                        }
                        )
                        // const walletsInTeam = Object.fromEntries(filterWalletInTeam)
                        setProject({
                            ...project,
                            partners: {
                                ...project.partners,
                                [user.uid]: {
                                    ...project.partners[user.uid],
                                    wallet: filterWalletInTeam[0]?.publicKey
                                }
                            },
                            projectHolder: {
                                ...project.projectHolder,
                                [user.uid]: {
                                    ...project.projectHolder[user.uid],
                                    wallet: filterWalletInTeam[0]?.publicKey
                                }
                            }
                        })
                    })

            })()
        }
    }, [db, user, firestore, program?.account?.group, router.query.team, project.fiatOrCrypto])


    const handleBudgetProject = (e, data) => {
        const value = Number(e.target.value)
        if (e.target.name === "amountPartners" || e.target.name === "percentage" || e.target.name === "wallet") {
            if (e.target.name === "wallet") {
                setProject({
                    ...project,
                    partners: {
                        ...project.partners,
                        [data.uid]: {
                            ...project.partners[data.uid],
                            [e.target.name]: e.target.value
                        }
                    },
                    projectHolder: {
                        [data.uid]: {
                            ...project.projectHolder[data.uid],
                            [e.target.name]: e.target.value
                        }
                    }
                })
            }
            if (e.target.name === "percentage") {
                setProject({
                    ...project,
                    partners: {
                        ...project.partners,
                        [data.uid]: {
                            ...project.partners[data.uid],
                            name: data.partner.name,
                            status: user.uid !== data.uid ? "ANNOUNCEMENT" : "CONFIRMED",
                            percentage: value,
                            amount: (value * ((project?.totalNeto - project?.thirdParties?.amount) * (1 - (project.ratio / 100)))) / 100,
                            email: data.partner.email,
                        }
                    },
                })
            }
            if (e.target.name === "amountPartners") {
                setProject({
                    ...project,
                    partners: {
                        ...project.partners,
                        [data.uid]: {
                            ...project.partners[data.uid],
                            name: data.partner.name,
                            amount: value,
                            percentage: (value / ((project?.totalNeto - project?.thirdParties?.amount) * (1 - (project.ratio / 100)))) * 100,
                            status: user.uid !== data.uid ? "ANNOUNCEMENT" : "CONFIRMED",
                            email: data.partner.email,
                        }
                    }
                })
            }
        }
    }

    const modifyBudget = () => {
        setAssembleTeam(false)
        setProject({
            ...project,
            partners: {
                [user.uid]: {
                    ...project.partners[user.uid],
                    amount: 0,
                    percentage: 0
                }
            }
        })
    }

    const renderInfo = (info) => {
        if (info) {
            return Object.entries(info).map(([key, value]) => {
                return (
                    <div key={key} className="flex flex-row h-10 w-full justify-between font-medium text-base items-center border-b-2 border-slate-300">
                        <label>{value.name}</label>
                        <p>{value.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                    </div>
                )
            })
        }
    };

    const removeSelect = (idPartner) => {
        const { [idPartner]: _, ...restPartners } = selectPartners
        setSelectPartners(restPartners)
        const { [idPartner]: __, ...resInfoPartners } = project.partners
        setProject({
            ...project,
            partners: resInfoPartners
        })
    }

    const handleConfirm = () => {
        confirmInfoProject("ASSEMBLE_TEAM", true)
    }

    return (
        <div className="flex flex-col text-center gap-8 items-center w-8/12" >
            <h1 className=" text-4xl font-medium">Assemble your team of partners</h1>
            {
                selectPartners &&
                <MultiSelect
                    label="Select your partners"
                    options={partners}
                    setSelectState={setSelectPartners}
                    selectState={selectPartners}
                    placeholder="Select your partners"
                    blockOption={user.uid}
                />
            }

            <div className="flex flex-col sm:grid w-full sm:grid-cols-2 gap-4">
                {
                    selectPartners && Object.entries(selectPartners).map(([key, select]) => {
                        return (
                            <div key={key} className={`flex flex-col rounded-xl border-[1px] border-white bg-zinc-800 shadow-lg shadow-zinc-700 p-2 gap-2`}>
                                <label className="flex flex-row justify-between w-full bg-zinc-700  rounded-xl text-lg font-normal h-12 p-2" htmlFor="partners">
                                    {select?.name}
                                    {
                                        user.uid !== key &&
                                        <button className="flex text-center justify-center items-center max-h-min w-min  rounded-full bg-black text-white text-base pl-3 pr-3" onClick={() => removeSelect(key)}>
                                            X
                                        </button>
                                    }
                                </label>
                                <div className=" flex columns-3 gap-4">
                                    <div className="flex flex-col items-center w-full">
                                        <h2 className=" font-medium">Amount</h2>
                                        <InputSelect
                                            inputStyle=" border shadow-none rounded-xl w-full h-16 text-xl p-4"
                                            type="number"
                                            name="amountPartners"
                                            value={project?.partners?.[key]?.amount?.toString()}
                                            onChange={(e) => handleBudgetProject(e, { uid: key, partner: select })}
                                            min={0}
                                        />
                                    </div>
                                    <div className="flex flex-col mt-6 justify-center w-min text-base font-bold ">
                                        <p> &gt; </p>
                                        <p> &lt; </p>
                                    </div>
                                    <div className="flex flex-col items-center w-full">
                                        <h2 className=" font-medium">%</h2>
                                        <InputSelect
                                            inputStyle="shadow-none border rounded-xl w-full h-16 text-xl p-4"
                                            type="number"
                                            name="percentage"
                                            value={project?.partners?.[key]?.percentage?.toString()}
                                            onChange={(e) => handleBudgetProject(e, { uid: key, partner: select })}
                                            min={0}
                                        />
                                    </div>
                                </div>
                                <span className=" text-xs">Fee proposal or grant remuneration</span>
                                {
                                    project.fiatOrCrypto === "CRYPTO" &&
                                    (
                                        user.uid === key &&
                                        <>
                                            <InputSelect
                                                optionDisabled="SelectWallet"
                                                name="wallet"
                                                title="Select your wallet"
                                                value={project?.partners?.[key]?.wallet}
                                                disabled
                                            />
                                        </>

                                    )
                                }
                            </div>
                        )
                    })
                }
            </div>
            <p>Confirm Project Budget</p>
            <ComponentButton
                buttonEvent={handleConfirm}
                buttonText="Confirm Team"
                buttonStyle={`h-14 ${(!!Object.values(errors).find(error => !!error)) ? "bg-[grey]" : "bg-[#5A31E1]"}`}
                conditionDisabled={errors.partners}
            />
        </div>

    )
}

export default AssembleTeam