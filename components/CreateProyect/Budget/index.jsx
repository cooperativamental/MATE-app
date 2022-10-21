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


const Budget = ({ setProject, project, confirmInfoProject, confirmation }) => {
    const db = getDatabase()
    // const [project, setProject] = useState({
    //     totalNeto: 0,
    //     totalBruto: 0,
    //     thirdParties: { amount: 0 },
    //     partners: {},
    // })
    const router = useRouter()
    const [errors, setErrors] = useState({})
    const { user, firestore } = useAuth()
    const [partners, setPartners] = useState()
    const [available, setAvailable] = useState(0)
    const [assembleTeam, setAssembleTeam] = useState()
    const [selectPartners, setSelectPartners] = useState()
    const [teams, setTeams] = useState()
    const [walletsHolder, setWalletHolder] = useState()
    const [selectWalletHolder, setSelectWalletHolder] = useState()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    useEffect(() => {
        if (program?.account?.group && user) {
            (async () => {

                const resTeamsWeb3 = await program?.account?.group.all()
                const findTeam = resTeamsWeb3?.find(team => team.publicKey.toBase58() === router.query.team)
                setTeams(findTeam.account)
                getDocs(queryFirestore(collection(firestore, 'users'), where("team", "array-contains", router.query.team)))
                    .then((resUsers) => {
                        let listUsers = {}
                        resUsers.forEach(user => {
                            listUsers = {
                                ...listUsers,
                                [user.id]: {
                                    ...user.data(),
                                    name: user.data().userName
                                }
                            }
                        })
                        setPartners(listUsers)
                        setSelectPartners({
                            ...selectPartners,
                            [user.uid]: listUsers[user.uid]
                        })
                    })
                if (project.fiatOrCrypto === "CRYPTO") {
                    // onValue(

                    // )
                    get(query(ref(db, `wallet/${user?.uid}`)))
                        .then(res => {
                            const convertWalletsInTeam = findTeam.account.members.map(member => member.toBase58())
                            const filterWalletInTeam = Object.values(res.val()).filter((wallet) => 
                            {
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
                }
            })()
        }
    }, [db, user, firestore, program?.account?.group, router.query.team, project.fiatOrCrypto])

    useEffect(() => {
        let amountTotalPartners = 0
        project?.partners && Object.values(project?.partners).forEach(partner => {
            if (!partner.amount) {
                amountTotalPartners += ((partner.percentage || 0) * (project.totalNeto - project?.thirdParties?.amount)) / 100
            } else {
                amountTotalPartners += (partner?.amount || 0)
            }
        })

        setAvailable(((project?.totalNeto - project?.thirdParties?.amount) * (1 - (project.ratio / 100))) - amountTotalPartners)
        
        setErrors({
            thirdParties: (project?.totalNeto - project?.thirdParties?.amount) < 0,
            available: ((project?.totalNeto - project?.thirdParties?.amount - ((project?.totalNeto - project?.thirdParties?.amount) * (project.ratio / 100))) - amountTotalPartners) < 0,
            totalPartners: (project?.totalNeto - project?.thirdParties?.amount - ((project?.totalNeto - project?.thirdParties?.amount) * (project.ratio / 100)) - amountTotalPartners) != 0,
            partners: !Object.keys(project?.partners).length || !!Object.entries(project?.partners).find(([keyPartner, partner]) => !partner.amount || (keyPartner === user.uid && !partner.wallet))
        })
    }, [project.totalNeto, project.thirdParties, project.partners, project.ratio])

    const handleBudgetProject = (e, data) => {
        const value = Number(e.target.value)
        if (e.target.name === "partners" || e.target.name === "percentage" || e.target.name === "wallet") {
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
                            fullName: data.partner.fullName,
                            status: user.uid !== data.uid ? "ANNOUNCEMENT" : "CONFIRMED",
                            percentage: value,
                            amount: (value * (project.totalNeto - project?.thirdParties?.amount - ((project?.totalNeto - project?.thirdParties?.amount) * (project.ratio / 100)))) / 100,
                            email: data.partner.email,
                        }
                    },
                })
            }
            if (e.target.name === "partners") {
                setProject({
                    ...project,
                    partners: {
                        ...project.partners,
                        [data.uid]: {
                            ...project.partners[data.uid],
                            fullName: data.partner.fullName,
                            amount: value,
                            percentage: (value / (project.totalNeto - project?.thirdParties?.amount - ((project?.totalNeto - project?.thirdParties?.amount) * (project.ratio / 100)))) * 100,
                            status: user.uid !== data.uid ? "ANNOUNCEMENT" : "CONFIRMED",
                            email: data.partner.email,
                        }
                    }
                })
            }
        } else if (e.target.name === "thirdParties") {
            setProject({
                ...project,
                [e.target.name]: { amount: value }
            })
        } else if (e.target.name === "totalNeto") {
            setProject({
                ...project,
                [e.target.name]: value,
                totalBruto: (value + value * ((teams.ratio) / 10000))
            })
        } else if (e.target.name === "totalBruto") {
            setProject({
                ...project,
                [e.target.name]: value,
                totalNeto: (value - value * ((teams.ratio) / 10000))
            })
        } else if (e.target.name === "ratio") {
            setProject({
                ...project,
                [e.target.name]: value,
                // totalNeto: !!value ? (project.totalNeto - (project.totalNeto * (value / 100))) : project.totalNeto
            })
        }
    }

    const handleConfirm = () => {
        Object.entries(project.partners).forEach(([key, partner]) => {
            if (!partner.amount) {
                const { percentage, ...resPartner } = partner
                project.partners = {
                    ...project.partners,
                    [key]: {
                        ...resPartner,
                        amount: (project?.partners?.[key]?.percentage * (project.totalNeto - project?.thirdParties?.amount)) / 100
                    }
                }

            }
        })
        confirmInfoProject({ ...confirmation, budget: true })
    }
    const removeSelect = (idPartner) => {
        const { [idPartner]: _, ...restPartners } = selectPartners
        setSelectPartners(restPartners)
        const { [idPartner]: __, ...resInfoPartners } = project.partners
        setProject({
            ...project,
            partners: resInfoPartners
        })
    }

    const renderInfo = (info) => {
        if (info) {
            return Object.entries(info).map(([key, value]) => {
                return (
                    <div key={key} className="flex flex-row h-10 w-full justify-between font-medium text-base items-center border-b-2 border-slate-300">
                        <label>{value.fullName}</label>
                        <p>{value.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                    </div>
                )
            })
        }
    };

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

    return (
        <>
            {
                !confirmation.budget ?
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
                                    disabled={assembleTeam ? "disabled" : false}

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
                                    disabled={assembleTeam ? "disabled" : false}

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
                                    disabled={assembleTeam ? "disabled" : false}
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
                                    disabled={assembleTeam ? "disabled" : false}
                                />
                            </div>
                            <p className=" text-xs text-gray-100 text-center">Reserve for extraordinary expenses, final clearing, budget deviations, etc.</p>
                        </div>
                        <div className="sticky top-16 z-20 bg-slate-900  border-[1px] border-x-slate-300 flex flex-col w-full font-bold gap-4 p-4 rounded-lg text-xl">
                            <div className={`flex justify-between ${errors?.available ? " text-red-600" : ""}`}>
                                <h3>
                                    Available Budget ◎:
                                </h3>
                                <h3>
                                    {`${available.toLocaleString('es-ar', { minimumFractionDigits: 2 })}`}
                                </h3>
                            </div>
                            <div className={`flex justify-between ${errors?.available ? " text-red-600" : ""}`}>
                                <h3>
                                    Reserve ◎:
                                </h3>
                                <h3>
                                    {`${((project?.ratio * (project?.totalNeto - project?.thirdParties?.amount)) /100 ).toLocaleString('es-ar', { minimumFractionDigits: 2 })}`}
                                </h3>
                            </div>
                            {
                                errors?.available &&
                                <p className=" text-sm font-medium">You cannot exceed the budget available for your team.</p>
                            }
                        </div>

                        <div className="flex flex-col text-center gap-8 min-h-[30rem]  items-center w-full" >
                            <h1 className=" text-4xl font-medium">Assemble your team of partners</h1>
                            <ComponentButton
                                buttonEvent={() =>
                                    !assembleTeam ?
                                        setAssembleTeam(true)
                                        :
                                        modifyBudget()
                                 }
                                buttonText={assembleTeam ? "Modify Budget" : "Add Team Member"}
                            />
                            {
                                assembleTeam &&
                                <>
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

                                    <div className="grid w-full grid-cols-2 gap-4">
                                        {
                                            selectPartners && Object.entries(selectPartners).map(([key, select]) => {
                                                return (
                                                    <div key={key} className={`flex flex-col rounded-xl border-[1px] border-white bg-zinc-800 shadow-lg shadow-zinc-700 p-2 gap-2`}>
                                                        <label className="flex flex-row justify-between w-full bg-zinc-700  rounded-xl text-lg font-normal h-12 p-2" htmlFor="partners">
                                                            {select.name}
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
                                                                    name="partners"
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
                                </>
                            }
                            <p>Confirm Project Budget</p>
                            <ComponentButton
                                buttonEvent={handleConfirm}
                                buttonText="Preview"
                                buttonStyle={`h-14 ${(!!Object.values(errors).find(error => !!error)) ? "bg-[grey]" : "bg-[#5A31E1]"}`}
                                conditionDisabled={!!Object.values(errors).find(error => !!error)}
                            />
                        </div>
                    </div>
                    :
                    <div className="flex flex-col items-center w-8/12 gap-4">
                        <div className="flex items-center h-8 w-full justify-between font-medium text-base">
                            <label>Total invoice ◎</label>
                            <p>{project.totalBruto}</p>
                        </div>
                        <div className="flex items-center h-8 w-full justify-between font-medium text-base">
                            <label>Net Total ◎</label>
                            <p>{project.totalNeto}</p>
                        </div>
                        <hr className="flex bg-slate-300 border-[1px] w-full " />
                        <div className="flex items-center h-4 w-full justify-between font-medium text-base">
                            <label>Third party expenses</label>
                            <p>{project.thirdParties?.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                        </div> 
  
                        <hr className="flex bg-slate-300 border-[1px] w-full " />

                        <div className="flex items-center h-10 w-full justify-between font-medium text-2xl">
                            <label>Team Budget ◎</label>
                            <p>{(project?.totalNeto - project?.thirdParties?.amount).toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <hr className="  flex bg-slate-300 border-[1px] w-full " />
                       
                        <div className="flex items-center h-4 w-full justify-between font-light text-sm">
                            <label>Reserve percentage %</label>
                            {project?.ratio}
                        </div>
                        <div className="flex items-center h-10 w-full justify-between font-light text-base">
                            <label>Reserve ◎</label>
                            {`${((project?.ratio * (project?.totalNeto - project?.thirdParties?.amount)) /100 ).toLocaleString('es-ar', { minimumFractionDigits: 2 })}`}
                        </div>
                        <hr className="  flex bg-slate-300 border-[3px] w-full " />

                        {
                            renderInfo(project.partners)

                        }

                    </div>

            }
        </>
    )
}

export default Budget

