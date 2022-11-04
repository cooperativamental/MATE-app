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
    const [gloablTeams, setTeams] = useState()
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
                            const resUsers = await getDocs(queryFirestore(collection(firestore, "users"), where("team", "array-contains", team?.publicKey?.toBase58())))
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
                                        if (user?.team?.includes(a.publicKey.toBase58())) {
                                            return -1
                                        } else {
                                            return 1
                                        }
                                    })
                                    const teamsIsOrNotMember = res.map(team => {
                                        let data = {
                                            id: team.publicKey.toBase58(),
                                            name: team.account.name,
                                            info: `Treasury ${team.account.ratio / 100}`,
                                            partners: team.partners,
                                            redirect: () => {
                                                router.push(
                                                    {
                                                        pathname: "/teams/[team]",
                                                        query: {
                                                            team: team.publicKey?.toBase58()
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
                                    setLoading(false)
                                })
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
                                setTeams(res)
                                setLoading(false)
                            })
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
                                info: `Trasury: ${teamInvited.treasury}`,
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
                                setTeams(res)
                                setLoading(false)
                            })
                    }
                }
            } catch (error) {
                console.log(error)
            }

        })()
    }, [db, firestore, user, program?.account?.group, connection, wallet, showTeam])

    // const render = (status) => {

    //     const renderToDatabase = (arr) => {
    //         return arr.map(([keyTeam, infoTeam]) => {
    //             return (
    //                 <Link
    //                     passHref
    //                     href={{
    //                         pathname: "/teams/confirmteam/[team]",
    //                         query: {
    //                             team: keyTeam
    //                         }
    //                     }}
    //                     as="/teams"
    //                     key={keyTeam}
    //                 >
    //                     <div
    //                         className="grid grid-cols-[60%_max-content] w-8/12 justify-between h-32 shadow-md bg-slate-900 shadow-slate-800 text-white rounded-lg p-4 ring-2 hover:ring-4"
    //                     >
    //                         <a
    //                             className="flex row-start-1 h-full justify-between"
    //                         >
    //                             <div
    //                                 className="flex flex-col justify-between"
    //                             >
    //                                 <h1 className="w-max text-xl font-bold"> {infoTeam?.name} </h1>

    //                             </div>
    //                             <p className=" self-center">
    //                                 {
    //                                     `Treasury Ratio ${infoTeam?.treasury} %`
    //                                 }
    //                             </p>
    //                         </a>
    //                     </div>
    //                 </Link>
    //             )
    //         })
    //     }

    //     const renders = {
    //         ALL_TEAMS: gloablTeams.length ?
    //             gloablTeams?.map((infoTeam) => {
    //                 const team = infoTeam
    //                 return (
    //                     <div
    //                         key={infoTeam.id}
    //                         className="grid grid-cols-[60%_max-content] w-8/12 justify-between h-32 shadow-md bg-slate-900 shadow-slate-800 text-white rounded-lg p-4 ring-2 hover:ring-4"
    //                     >
    //                         <Link
    //                             passHref
    //                             href={{
    //                                 pathname: "/teams/[team]",
    //                                 query: {
    //                                     team: infoTeam?.publicKey?.toBase58()
    //                                 }
    //                             }}
    //                             as="/teams"
    //                         >
    //                             <a
    //                                 className="flex row-start-1 h-full justify-between"
    //                             >
    //                                 <div
    //                                     className="flex flex-col justify-between"
    //                                 >
    //                                     <h1 className="w-max text-xl font-bold"> {team.name} </h1>
    //                                     <div className="flex -space-x-2">
    //                                         {
    //                                             !!Object.keys(infoTeam.partners).length &&
    //                                             Object.entries(infoTeam.partners)
    //                                                 .map(([keyUser, user]) => {

    //                                                     return (
    //                                                         <div
    //                                                             key={keyUser}
    //                                                             className="relative flex justify-center items-center h-8 w-8 bg-slate-900 rounded-full ring-1 ring-white"
    //                                                             onMouseOver={() => {
    //                                                                 setInfoUser({
    //                                                                     ...user,
    //                                                                     key: `${keyUser}${infoTeam.id}`
    //                                                                 })
    //                                                             }}
    //                                                             onMouseOut={() => {
    //                                                                 setInfoUser()
    //                                                             }}
    //                                                         >
    //                                                             <p className=" text-white font-bold">
    //                                                                 {
    //                                                                     user.name.split(" ").map(sep => {
    //                                                                         return (
    //                                                                             sep[0]
    //                                                                         )
    //                                                                     })
    //                                                                 }
    //                                                             </p>
    //                                                             {
    //                                                                 infoUser?.key === `${keyUser}${infoTeam.id}` &&
    //                                                                 <div className="absolute text-black font-bold outline-double outline-4 outline-white -top-12 rounded-md bg-slate-500 h-max z-20 p-2">
    //                                                                     <p>{infoUser.name}</p>
    //                                                                 </div>
    //                                                             }
    //                                                         </div>
    //                                                     )
    //                                                 })
    //                                         }
    //                                     </div>
    //                                 </div>
    //                                 <p className=" self-center">
    //                                     {
    //                                         `Treasury Ratio ${team?.ratio / 100} %`
    //                                     }
    //                                 </p>
    //                             </a>
    //                         </Link>
    //                         {
    //                             infoTeam.isMember &&
    //                             <ComponentButton
    //                                 buttonText="Start Project"
    //                                 buttonStyle="w-max h-full ring-1 hover:ring-2 hover:bg-slate-800 ring-slate-400"
    //                                 buttonEvent={() => {
    //                                     router.push(
    //                                         {
    //                                             pathname: "/createproject",
    //                                             query: {
    //                                                 team: infoTeam.publicKey.toBase58()
    //                                             },
    //                                         },
    //                                         "/createproject",
    //                                         {
    //                                             shallow: true
    //                                         }
    //                                     )
    //                                 }}
    //                             />
    //                         }
    //                     </div>
    //                 )
    //             })
    //             :
    //             <></>
    //         ,
    //         CONTRACT_RECEIVED: teamsInvite && renderToDatabase(Object.entries(teamsInvite)),
    //         SEND_CONTRACTS: teamPendingToConfirm && renderToDatabase(Object.entries(teamPendingToConfirm)),
    //     }
    //     return renders[status]
    // }

    return (
        <div className="flex flex-col py-8 items-center w-full gap-8">
            <ComponentButton
                buttonText="Create New Team"
                buttonStyle="w-48 h-14 ring-1 hover:ring-2 ring-slate-400"
                buttonEvent={() => {
                    router.push(
                        "/createteam"
                    )
                }}
            />
            <HeadBar
                event={(value) => {
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
                }}
                tabs={tabs}
            />
            {
                loading ?
                    <div className=" flex flex-col items-center justify-center w-11/12 h-96  ">
                        <div className="animate-spin border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
                    </div>
                    :
                    <div className="w-8/12">
                        <CardList list={gloablTeams} />
                    </div>
            }

            <div className="flex flex-col py-4 items-center h-full w-full gap-8 overflow-y-auto scrollbar">

                {/* {
                    render(showTeam)
                } */}
            </div>


        </div>
    )
}

export default Teams