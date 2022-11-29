import { useEffect, useState } from "react"

import { useRouter } from "next/router"
import Link from "next/link"

import { useAuth } from "../../../context/auth"
import { equalTo, get, getDatabase, ref, orderByChild, query, onValue, update } from "firebase/database"
import { getDocs, collection, getDoc, updateDoc, doc, where, query as queryFirestore, arrayUnion, onSnapshot } from "firebase/firestore"

import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js"

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { useProgram } from "../../../hooks/useProgram/index.ts"

import ComponentButton from "../../Elements/ComponentButton"
import { usePopUp } from "../../../context/PopUp"
import { MultiSelectPartners } from "../../MultiSelectPartners"


const ConfirmTeam = () => {
    const db = getDatabase()
    const router = useRouter()
    const { firestore, user } = useAuth()
    const { handlePopUp } = usePopUp()
    const [team, setTeam] = useState()
    const [addPartner, setAddPartner] = useState()
    const [projects, setProjects] = useState([])
    const [listMate, setListMate] = useState()
    const [blockOption, setBlockOptions] = useState()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet })
    const { publicKey } = useWallet()

    // const addToTeam = () => {
    //     Object.entries(listPartners).map(async ([keyPartner, partner]) => {
    //         const resPartner = await getDoc(doc(firestore, "users", keyPartner))
    //         if (!resPartner.data().team.find(teamPartner => teamPartner === router.query.group)) {
    //             updateDoc(doc(firestore, "users", keyPartner), {
    //                 group: arrayUnion(router.query.team)
    //             })
    //         }
    //     })
    // }

    useEffect(() => {
        (async () => {
            const unsubscribe = onValue(ref(db, `team/${router.query.team}`),
                (infoTeam) => {
                    setTeam(infoTeam.val())
                }
            )
            return () => unsubscribe()
        })()
    }, [db, firestore, router.query.team])

    useEffect(() => {
        if (publicKey) {
            setTeam({
                ...team,
                guests: {
                    ...team?.guests,
                    [user?.uid]: {
                        ...team?.guests[user.uid],
                        wallet: publicKey.toBase58()
                    }
                }
            })
        }
    }, [publicKey])

    const confirmTeam = async () => {
        if (team.teamCreator[user.uid] && team.guests[user.uid].wallet) {

            const partnersConfirmed = Object.values(team.guests).filter(partner =>
                partner.status !== "INVITED"
            )
                .map(partner => {
                    return new PublicKey(partner?.wallet)
                })
            const [groupPublicKey] = web3.PublicKey.findProgramAddressSync(
                [Buffer.from("group"), Buffer.from(team.name)],
                program.programId,
            )
            const tx = await program.rpc
                .createGroup(
                    team.name,
                    team.treasury * 100,
                    partnersConfirmed, //reemplazar por wallets-
                    {
                        accounts: {
                            group: groupPublicKey,
                            payer: wallet.publicKey,
                            systemProgram: SystemProgram.programId,
                        }
                    }
                )
            // const groupRef = ref(db, "groups/");
            // const pushGroup = push(groupRef);

            // set(pushGroup, {
            //     ...group,
            //     treasury: group.treasury / 100
            // })
            await updateDoc(doc(firestore, "users", user.uid), {
                team: arrayUnion(groupPublicKey.toBase58())
            })
            await update(ref(db, `team/${router.query.team}/`),
                {
                    status: "CREATED",
                    wallet: publicKey.toBase58()
                })
            await update(ref(db, `users/${user.uid}/teamCreator/${router.query.team}`),
                {
                    status: "CREATED",
                })
            Object.keys(team?.guests).map(async (keyPartner) => {
                await updateDoc(doc(firestore, "users", keyPartner), {
                    team: arrayUnion(groupPublicKey.toBase58())
                })
            })
            console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
            handlePopUp({
                text:
                    <div className="">
                        <p>View on Explorer</p>
                        <Link
                            href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
                        >
                            <a
                                target="_blank"
                                className="flex w-8/12 font-semibold text-xl overflow-hidden text-clip">
                                {`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
                            </a>
                        </Link>
                    </div>,
                title: `New Team`,
                onClick: () => {
                    router.push({
                        pathname: "/teams/[team]",
                        query: {
                            team: groupPublicKey.toBase58()
                        }
                    })
                }
            })
        }
    }

    const confirmInvite = () => {
        update(ref(db, `team/${router.query.team}/guests/${user.uid}`),
            {
                status: "CONFIRMED",
                wallet: publicKey.toBase58()
            })
        update(ref(db, `users/${user.uid}/teamInvite/${router.query.team}`),
            {
                status: "CONFIRMED",
                wallet: publicKey.toBase58()
            })
    }


    return (
        <div className="flex flex-col py-8 h-min w-6/12 gap-8">
            <div className="flex w-full justify-between items-center">
                <div>
                    <p>Team Name:</p>
                    <h1 className="text-2xl font-semibold">
                        {team?.name}
                    </h1>
                </div>
            </div>
            <div className="flex w-full justify-between items-center">
                <div>
                    <p className="font-semibold">
                        Treasury {team?.treasury}%
                    </p>
                    <button
                        className=" text-secondary-color font-semibold"
                    >
                        Vote Review (ComingUp)
                    </button>
                </div>
                <button
                    className=" text-secondary-color font-semibold"
                >
                    Treasury Funds Proposal (ComingUp)
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <p className="text-xl font-bold">Associate Members</p>
                <div className="flex flex-col gap-8">
                    {
                        team?.guests && Object.entries(team?.guests).map(([keyUser, userTeam]) => {
                            return (
                                <div
                                    key={keyUser}
                                    className={`flex justify-between w-full ring-2 ring-slate-200 p-4 rounded-lg ${userTeam.status === "INVITED" && "bg-yellow-600" || userTeam.status === "CONFIRMED" && "bg-green-600"}`}
                                >
                                    <p key={keyUser} className="font-semibold">
                                        {userTeam.name}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <p>
                                            {
                                                userTeam.status
                                            }
                                        </p>
                                        {
                                            userTeam.status === "INVITED" && (keyUser === user.uid) &&
                                            (
                                                publicKey ?
                                                    <ComponentButton
                                                        buttonEvent={confirmInvite}
                                                        buttonText="Confirm Invite"
                                                        buttonStyle="ring-white"
                                                    />
                                                    :
                                                    <WalletMultiButton>Connect Wallet</WalletMultiButton>

                                            )

                                        }
                                    </div>

                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <p className="text-xl font-bold">Associate Members</p>
                <div className="flex flex-col gap-8">
                    {
                        team?.invitedNotRegistered?.map(invited => {
                            return (
                                <div
                                    key={invited}
                                    className={`flex justify-between w-full ring-2 ring-slate-200 p-4 rounded-lg "bg-yellow-600"`}
                                >
                                    <p className="font-semibold">
                                        {invited}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <p>
                                            Not Registered
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            {
                team?.teamCreator?.[user.uid] &&
                (
                    publicKey ?
                        <ComponentButton
                            buttonText="Create Team"
                            buttonEvent={confirmTeam}
                        />
                        :
                        <div className="flex flex-col w-full items-center">
                            <p>Sign Team Smart Contract on Solana</p>
                            <WalletMultiButton>Connect Wallet</WalletMultiButton>

                        </div>
                )
            }
            {/* <div>
                {
                    (group?.users[user?.uid] && !addPartner) &&
                    <ComponentButton
                        buttonEvent={() => setAddPartner(true)}
                        buttonText="Add Partner"
                    />
                }
                {
                    addPartner &&
                    <div className="flex flex-col items-center gap-8">
                        <MultiSelectPartners
                            label="Search your Team Mate"
                            options={listMate}
                            searchFunction={searchFunction}
                            selectState={listPartners}
                            setSelectState={setListPartners}
                            blockOption={blockOption}
                        />
                        <ComponentButton
                            buttonEvent={() => addToGroup()}
                            buttonText="Add To Group"
                        />
                    </div>
                }
            </div> */}
        </div>
    )
}

export default ConfirmTeam