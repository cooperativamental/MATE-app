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


const Organization = () => {
    const db = getDatabase()
    const router = useRouter()
    const { firestore, user } = useAuth()
    const [organization, setOrganization] = useState()
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
            const { userName, ...resUser } = user.data()
            if (!organization?.users?.[user.id]) {
                resPartners = {
                    ...resPartners,
                    [user.id]: {
                        ...resUser,
                        name: userName,
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

    // const addToOrganization = () => {
    //     Object.entries(listPartners).map(async ([keyPartner, partner]) => {
    //         const resPartner = await getDoc(doc(firestore, "users", keyPartner))
    //         if (!resPartner.data().organization.find(organizationPartner => organizationPartner === router.query.group)) {
    //             updateDoc(doc(firestore, "users", keyPartner), {
    //                 group: arrayUnion(router.query.organization)
    //             })
    //         }
    //     })
    // }

    useEffect(() => {

        if (program?.account?.group) {
            (async () => {
                const resOrganizationWeb3 = await program?.account?.group.all()
                const organizationQuery = resOrganizationWeb3?.find(organization => organization.publicKey.toBase58() === router.query.organization)
                console.log(organizationQuery.publicKey.toBase58())
                const unSubscribeSnapshot = onSnapshot(queryFirestore(collection(firestore, "users"), where("organization", "array-contains", organizationQuery?.publicKey?.toBase58())),
                    (resUsers) => {
                        let users = {}

                        resUsers.forEach(user => {
                            const { userName, ...resUser } = user.data()
                            users = {
                                ...users,
                                [user.id]: {
                                    ...resUser,
                                    name: userName,
                                }
                            }
                        })
                        const infoOrganization = {
                            ...organizationQuery,
                            users
                        }
                        setOrganization(infoOrganization)
                        setListMate(users)
                        setListPartners(users)
                        setBlockOptions(Object.keys(users).map(key => key))
                    }
                )
                return () => unSubscribeSnapshot()
            })()
        }
        get(query(ref(db, `projects`), orderByChild("organization"), equalTo(router.query.organization)))
            .then(res => res.val())
            .then(projects => {
                setProjects(projects)
            })
    }, [db, firestore, router.query.organization, program?.account?.group])

    return (
        <div className="flex flex-col py-8 h-min w-6/12 gap-8">
            <div className="flex w-full justify-between items-center">
                <div>
                    <p>Organization Name:</p>
                    <h1 className="text-2xl font-semibold">
                        {organization?.account?.name}
                    </h1>
                </div>
                {
                    organization?.users[user?.uid] &&
                    <div className="flex gap-8 h-full">

                        <ComponentButton
                            buttonText="Start a Project"
                            buttonStyle="w-max"
                            buttonEvent={() => {
                                router.push(
                                    {
                                        pathname: "/createproject",
                                        query: {
                                            organization: router.query.organization
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
                                        organization: router.query.organization
                                    }
                                })
                            }}
                        />
                    </div>
                }
            </div>
            <div className="flex w-full justify-between items-center">
                <div>
                    <p className="font-semibold">
                        Treasury {organization?.account?.ratio / 100}%
                    </p>
                    <button
                        className=" text-secondary-color font-semibold"
                    >
                        Vote Review (in comming)
                    </button>
                </div>
                <button
                    className=" text-secondary-color font-semibold"
                >
                    Treasury Funds Proposal (in comming)
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <p className="text-xl font-bold">Associate Members</p>
                <div className="flex flex-col gap-8">
                    {
                        organization?.users && Object.entries(organization.users).map(([keyUser, user]) => {
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
            <div className="flex flex-col ">
                <p className="text-xl font-bold">Project's {organization?.account?.name}</p>
                <div className="flex flex-col gap-8">
                    {
                        projects && Object.entries(projects).map(([keyProject, project]) => {
                            return (
                                <Link
                                    key={keyProject}
                                    passHref
                                    href={{
                                        pathname: "/adminprojects",
                                        query: {
                                            prj: keyProject
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
                                                        prjHolder => prjHolder.fullName
                                                    )
                                                    :
                                                    Object.values(project?.projectHolder).map(
                                                        prjHolder => prjHolder.fullName
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
        </div>
    )
}

export default Organization