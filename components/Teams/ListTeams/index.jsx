import { useState, useEffect } from "react"

import Link from "next/link"
import { useRouter } from "next/router"

import { get, getDatabase, ref, query, equalTo, orderByChild } from "firebase/database"
import { getDocs, getDoc, doc, collection, where, query as queryFirestore } from "firebase/firestore"

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../../../hooks/useProgram/index.ts"

import { useAuth } from "../../../context/auth"
import ComponentButton from "../../Elements/ComponentButton"
import HeadBar from "../../Elements/HeadTab"
import CardList from "../../Elements/CardList"

const Teams = () => {
    const db = getDatabase()
    const router = useRouter()
    const { user, firestore } = useAuth()
    const [showTeam, setShowTeams] = useState("ALL_TEAMS")
    const [gloablTeams, setTeams] = useState([])
    const [tabs, setTabs] = useState([
        { name: 'All Teams', current: true, value: "ALL_TEAMS" },
        { name: 'Hosting', current: false, value: "SEND_CONTRACTS" },
        { name: 'Invited', current: false, value: "CONTRACT_RECEIVED" },

    ])
    const [loading, setLoading] = useState(true)

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    useEffect(() => {
        (async () => {
            try {
                if (showTeam === "ALL_TEAMS") {
                    const resTeamsWeb3 = await program?.account?.group?.all()
                    if (resTeamsWeb3?.length) {
                        const listTeams = resTeamsWeb3?.map(async team => {
                            const resUsers = await getDocs(queryFirestore(collection(firestore, "users"), where("team", "array-contains", team?.account.name)))
                            let partners = []
                            resUsers.forEach(user => {
                                partners = [
                                    ...partners,
                                    {
                                        ...user.data(),
                                        id: user.id
                                    }
                                ]
                            })
                            return {
                                ...team,
                                partners
                            }
                        })
                        if (listTeams) {
                            Promise.all(listTeams)
                                .then(res => {
                                    res.sort((a) => {
                                        if (user?.team?.includes(a.account.name)) {
                                            return -1
                                        } else {
                                            return 1
                                        }
                                    })
                                    const teamsIsOrNotMember = res.map(team => {
                                        let data = {
                                            id: team.account.name,
                                            name: team.account.name,
                                            info: `Treasury ${team.account.ratio / 100}`,
                                            partners: team.partners,
                                            button: () =>
                                                router.push(
                                                    {
                                                        pathname: "/createproject",
                                                        query: {
                                                            team: team.account.name
                                                        },
                                                    },
                                                    "/createproject",
                                                    {
                                                        shallow: true
                                                    }
                                                )

                                            ,
                                            redirect: () => {
                                                router.push(
                                                    {
                                                        pathname: "/teams/[team]",
                                                        query: {
                                                            team: team.account.name
                                                        }
                                                    },
                                                    "/teams",
                                                    { shallow: true }
                                                )
                                            }

                                        }
                                        if (user?.team?.includes(team.publicKey.toBase58())) {
                                            data = {
                                                ...data,
                                                isMember: true
                                            }
                                        }
                                        return data
                                    })
                                    setTeams(teamsIsOrNotMember)
                                })
                        } else {
                            setTeams([])
                        }
                    }
                }
                if (showTeam === "SEND_CONTRACTS") {
                    const teamCreatorUserLog = await get(query(ref(db, `users/${user?.uid}/teamCreator`), orderByChild("status"), equalTo("INVITE")))
                    if (teamCreatorUserLog.hasChildren()) {
                        const getInfoTeamCreator = Object.keys(teamCreatorUserLog.val()).map(async (keyTeamCreators) => {
                            const teamCreator = await (await get(ref(db, `team/${keyTeamCreators}`))).val()
                            const arrPartner = Object.entries(teamCreator.guests).map(([keyPartner, partner]) => {
                                return {
                                    id: keyPartner,
                                    name: partner.name,
                                }
                            })
                            return {
                                id: keyTeamCreators,
                                info: `Trasury: ${teamCreator.treasury}`,
                                name: teamCreator.name,
                                partners: arrPartner,

                                redirect: () => {
                                    router.push(
                                        {
                                            pathname: "/teams/confirmteam/[team]",
                                            query: {
                                                team: keyTeamCreators
                                            }
                                        },
                                        "/teams",
                                        { shallow: true }
                                    )
                                }
                            }
                        })

                        Promise.all(getInfoTeamCreator)
                            .then((res) => {
                                setTeams(res.reverse())
                            })
                    } else {
                        setTeams([])
                    }
                }
                if (showTeam === "CONTRACT_RECEIVED") {
                    const getTeamsInvite = await get(query(ref(db, `users/${user?.uid}/teamInvite`)))
                    if (getTeamsInvite.hasChildren()) {
                        const getInfoTeamInvite = Object.keys(getTeamsInvite.val()).map(async (keyTeamInvite) => {
                            const teamInvited = await (await get(ref(db, `team/${keyTeamInvite}`))).val()
                            const arrPartner = Object.entries(teamInvited.guests).map(([keyPartner, partner]) => {
                                return {
                                    id: keyPartner,
                                    name: partner.name,
                                }
                            })
                            return {
                                id: keyTeamInvite,
                                info: `Trasury: ${teamInvited.treasury} %`,
                                name: teamInvited.name,
                                partners: arrPartner,
                                redirect: () => {
                                    router.push(
                                        {
                                            pathname: "/teams/confirmteam/[team]",
                                            query: {
                                                team: keyTeamInvite
                                            }
                                        },
                                        "/teams",
                                        { shallow: true }
                                    )
                                }
                            }
                        })
                        Promise.all(getInfoTeamInvite)
                            .then((res) => {
                                setTeams(res.reverse())
                            })
                    } else {
                        setTeams([])
                    }
                }
            } catch (error) {
                console.log(error)
            }
            setLoading(false)
        })()
    }, [db, firestore, user, program?.account?.group, connection, wallet, showTeam])

    return (
        <div className="flex flex-col py-8 items-center w-full gap-8">
            <ComponentButton
                buttonText="Create New Team"
                buttonStyle="w-48 p-4"
                buttonEvent={() => {
                    router.push(
                        "/createteam"
                    )
                }}
            />
            <HeadBar
                event={(value) => {
                    if (value !== showTeam) {
                        setLoading(true)
                        setShowTeams(value)
                        const setTab = tabs.map(tab => {
                            if (tab.value === value) {
                                tab.current = true
                            } else {
                                tab.current = false
                            }
                            return tab
                        })
                        setTabs(setTab)
                    }
                }}
                tabs={tabs}
            />
            {
                loading ?
                    <div className=" flex flex-col items-center justify-center w-11/12 h-96  ">
                        <div className="animate-spin border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
                    </div>
                    :
                    <div className="w-full">
                        <CardList list={gloablTeams} />
                    </div>
            }


        </div>
    )
}

export default Teams