import { useEffect, useState } from "react"

import { useRouter } from "next/router"
import Link from "next/link"

import { useAuth } from "../../../context/auth"
import { equalTo, get, getDatabase, ref, orderByChild, query, onValue, update } from "firebase/database"
import { getDocs, collection, getDoc, updateDoc, doc, where, query as queryFirestore, arrayUnion, onSnapshot } from "firebase/firestore"

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { useProgram } from "../../../hooks/useProgram/index.ts"

import ComponentButton from "../../Elements/ComponentButton"
import { MultiSelectPartners } from "../../MultiSelectPartners"


const ConfirmTeam = () => {
    const db = getDatabase()
    const router = useRouter()
    const { firestore, user } = useAuth()
    const [team, setTeam] = useState()
    const [addPartner, setAddPartner] = useState()
    const [projects, setProjects] = useState([])
    const [listPartners, setListPartners] = useState()
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
            const keyTeam = anchor.web3.Keypair.generate();
            const keyTreasury = anchor.web3.Keypair.generate();
            const tx = await program.rpc
                .createGroup(
                    team.name,
                    team.treasury * 100,
                    partnersConfirmed, //reemplazar por wallets-
                    {
                        accounts: {
                            group: keyTeam.publicKey,
                            treasury: keyTreasury.publicKey,
                            initializer: wallet.publicKey,
                            systemProgram: SystemProgram.programId,
                        },
                        signers: [keyTeam]
                    }
                )
            // const groupRef = ref(db, "groups/");
            // const pushGroup = push(groupRef);

            // set(pushGroup, {
            //     ...group,
            //     treasury: group.treasury / 100
            // })
            updateDoc(doc(firestore, "users", user.uid), {
                team: arrayUnion(keyTeam.publicKey.toBase58())
            })
            Object.keys(listPartners).map((keyPartner) => {
                updateDoc(doc(firestore, "users", keyPartner), {
                    team: arrayUnion(keyTeam.publicKey.toBase58())
                })
            })
            console.log(`https://explorer.solana.com/tx/${tx}?cluster=devnet`);
            alert("success")
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
                        Vote Review (incoming)
                    </button>
                </div>
                <button
                    className=" text-secondary-color font-semibold"
                >
                    Treasury Funds Proposal (incoming)
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <p className="text-xl font-bold">Associate Members</p>
                <div className="flex flex-col gap-8">
                    {
                        team?.guests && Object.entries(team?.guests).map(([keyUser, userTeam]) => {
                            console.log(userTeam.status === "INVITED", (keyUser === user.uid), "asfasf")
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
                                                    <WalletMultiButton />
                                            )

                                        }
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
                            <p>Select wallet to connect with the team</p>
                            <WalletMultiButton />
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