import { useEffect, useState } from "react"

import { useRouter } from "next/router"
import Link from "next/link"

import { useAuth } from "../../../context/auth"
import { equalTo, get, getDatabase, ref, orderByChild, query } from "firebase/database"
import { getDocs, collection, getDoc, updateDoc, doc, where, query as queryFirestore, arrayUnion, onSnapshot } from "firebase/firestore"

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../../../hooks/useProgram/index.ts"

import ComponentButton from "../../Elements/ComponentButton"
import { MultiSelectPartners } from "../../MultiSelectPartners"


const Team = () => {
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
    const { program } = useProgram({ connection, wallet });

    const searchFunction = async (searchMate) => {

        const users = await getDocs(
            queryFirestore(
                collection(firestore, "users"),
                where("wallets", "array-contains", searchMate)
            ))
        let resPartners = {}
        users.forEach(user => {
            const { name, ...resUser } = user.data()
            if (!team?.users?.[user.id]) {
                resPartners = {
                    ...resPartners,
                    [user.id]: {
                        ...resUser,
                        name: name,
                        wallets: searchMate
                    }
                }
            }

        })
        if (listPartners && Object.keys(listPartners).length) {
            setListMate({
                ...listPartners,
                ...resPartners
            })
        } else {
            setListMate({
                ...resPartners
            })
        }
    }

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

        if (program?.account?.group) {
            (async () => {
                console.log(router.query.team)
                const resTeamWeb3 = await program?.account?.group.all()
                const teamQuery = resTeamWeb3?.find(team => team.account.name === router.query.team)
                console.log(teamQuery)
                const unSubscribeSnapshot = onSnapshot(queryFirestore(collection(firestore, "users"), where("team", "array-contains", teamQuery?.account.name)),
                    (resUsers) => {
                        let users = {}

                        resUsers.forEach(user => {
                            const { name, ...resUser } = user.data()
                            users = {
                                ...users,
                                [user.id]: {
                                    ...resUser,
                                    name: name,
                                }
                            }
                        })
                        const infoTeam = {
                            ...teamQuery,
                            users
                        }
                        setTeam(infoTeam)
                        // setListPartners(users)
                        // setBlockOptions(Object.keys(users).map(key => key))
                    }
                )
                return () => unSubscribeSnapshot()

            })()
        }
        get(query(ref(db, `projects`), orderByChild("team"), equalTo(router.query.team)))
            .then(res => res.val())
            .then(projects => {
                setProjects(projects)
            })
    }, [db, firestore, router.query.team, program?.account?.group])

    return (
        <div className="flex flex-col py-8 h-min w-10/12 gap-8">
            <div className="flex w-full justify-between items-center">
                <div className="bg-box-color p-6">
                    <p className="text-xs">Team Name:</p>
                    <h1 className="text-2xl font-semibold">
                        {team?.account?.name}
                    </h1>
                </div>
                {
                    team?.users?.[user?.uid] &&
                    <div className="flex gap-8 h-full">
                        <ComponentButton
                            buttonText="Start Project"
                            buttonStyle="w-max"
                            buttonEvent={() => {
                                router.push(
                                    {
                                        pathname: "/createproject",
                                        query: {
                                            team: router.query.team
                                        }
                                    },
                                    "/createproject",
                                    {
                                        shallow: true
                                    }
                                )
                            }}
                        />
                        <ComponentButton
                            buttonText="CreateClient"
                            buttonStyle="w-max"
                            buttonEvent={() => {
                                router.push({
                                    pathname: "/createclient",
                                    query: {
                                        team: router.query.team
                                    }
                                })
                            }}
                        />
                    </div>
                }
            </div>
            <div className="flex w-full justify-between items-center">
                <div>
                    <p className="font-semibold text-yellow-color">
                        Treasury Agreement: {team?.account?.ratio / 100}%
                    </p>
                    <button
                        className=" text-sm font-thin"
                    >
                        Ask a Review (Coming Up)
                    </button> - 
                    <button
                    className=" text-sm font-thin"
                >
                    Treasury Proposal  (Coming Up)
                </button>
                </div>
             
            </div>
            <div className="flex flex-col gap-4">
                <p className="text-xl font-bold text-orange-color">Members:</p>
                <div className="flex flex-col gap-8">
                    {
                        team?.users && Object.entries(team.users).map(([keyUser, user]) => {
                            return (
                                <p key={keyUser} className="font-semibold">
                                    {user.name}
                                </p>
                            )
                        })
                    }
                </div>
            </div>
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
            {
                projects &&
                <div className="flex flex-col ">
                    <p className="text-xl font-bold text-violet-color">Project's {team?.account?.name}</p>
                    <div className="flex flex-col gap-8">
                        {
                            Object.entries(projects).map(([keyProject, project]) => {
                                console.log(keyProject)
                                return (
                                    <Link
                                        key={keyProject}
                                        passHref
                                        href={{
                                            pathname: "/adminprojects",
                                            query: {
                                                id: keyProject
                                            }
                                        }}
                                        as="/adminprojects"
                                    >
                                        <a className="flex w-full justify-between p-4 border-b-2 border-white font-semibold">
                                            <h5>{project?.nameProject}</h5>
                                            <p>
                                                {
                                                    project?.projectOwner ?
                                                        Object.values(project?.projectOwner).map(
                                                            prjHolder => prjHolder.name
                                                        )
                                                        :
                                                        Object.values(project?.projectHolder).map(
                                                            prjHolder => prjHolder.name
                                                        )
                                                }
                                            </p>
                                        </a>
                                    </Link>
                                )
                            })
                        }
                    </div>
                </div>
            }
        </div>
    )
}

export default Team