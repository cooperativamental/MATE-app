import { useState, useEffect } from "react"

import Link from "next/link"
import { useRouter } from "next/router"

import { get, getDatabase, ref } from "firebase/database"
import { getDocs, getDoc, doc, collection, where, query } from "firebase/firestore"

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../../../hooks/useProgram/index.ts"

import { useAuth } from "../../../context/auth"
import ComponentButton from "../../Elements/ComponentButton"

const Organizations = () => {
    const db = getDatabase()
    const router = useRouter()
    const { user, firestore } = useAuth()
    const [organizations, setOrganizations] = useState()
    const [infoUser, setInfoUser] = useState()
    const [loading, setLoading] = useState(true)

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });

    useEffect(() => {
        (async () => {
            const resOrganizationsWeb3 = await program?.account?.group.all()
            const listOrganizations = resOrganizationsWeb3?.map(async organization => {
                const resUsers = await getDocs(query(collection(firestore, "users"), where("organization", "array-contains", organization?.publicKey.toBase58())))
                let users = {}
                resUsers.forEach(user => {
                    users = {
                        ...users,
                        [user.id]: user.data()
                    }
                })
                return {
                    ...organization,
                    users
                }
            })
            if (listOrganizations) {
                Promise.all(listOrganizations)
                    .then(res => {
                        res.sort((a, b) => {
                            if (user?.organization?.includes(a.publicKey.toBase58())) {
                                return -1
                            } else {
                                return 1
                            }
                        })
                        const organizationsIsOrNotMember = res.map(organization => {
                            if (user?.organization?.includes(organization.publicKey.toBase58())) {
                                return {
                                    ...organization,
                                    isMember: true
                                }
                            }
                            return organization
                        })
                        setOrganizations(organizationsIsOrNotMember)
                        setLoading(false)
                    })
            }
        })()
    }, [firestore, user, program?.account?.group])




    // useEffect(() => {
    //     if (user) {

    //         getDoc(doc(firestore, "users", user.uid))
    //             .then(res => {
    //                 if (res.exists()) {
    //                     const resUserAdmin = res.data()
    //                     if (resUserAdmin.group) {
    //                         const usersByGroups = resUserAdmin.group.map(async keyGroup => {
    //                             const groups = await get(ref(db, `groups/${keyGroup}`))
    //                             const resUsers = await getDocs(query(collection(firestore, "users"), where("group", "array-contains", keyGroup)))
    //                             let users = {}
    //                             resUsers.forEach(user => {
    //                                 users = {
    //                                     ...users,
    //                                     [user.id]: user.data()
    //                                 }
    //                             })
    //                             return ({
    //                                 [keyGroup]: {
    //                                     ...groups.val(),
    //                                     users: users
    //                                 }
    //                             })
    //                         })
    //                         Promise.all(usersByGroups)
    //                             .then(infoGroup => {
    //                                 let groups = {}
    //                                 infoGroup.map(group => {
    //                                     groups = {
    //                                         ...groups,
    //                                         ...group
    //                                     }
    //                                 })

    //                                 setLoading(false)
    //                                 setGroups(groups)
    //                             })
    //                     } else {
    //                         setLoading(false)
    //                     }
    //                 }

    //             })
    //     }
    // }, [db, user, firestore])

    if (loading) return (
        <div className=" flex  flex-col items-center justify-center w-11/12 h-96  ">
            <div className="animate-spin border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
        </div>
    )

    return (
        <div className="flex flex-col py-8 items-center w-full gap-8">
            {
                organizations?.length ?
                    <>
                        <ComponentButton
                            buttonText="Add new team"
                            buttonStyle="w-48 h-14 ring-1 hover:ring-2 ring-slate-400"
                            buttonEvent={() => {
                                router.push(
                                    "/createorganization"
                                )
                            }}
                        />
                        <div className="flex flex-col py-4 items-center h-full w-full gap-8 overflow-y-auto scrollbar">

                            {
                                organizations?.map((infoOrganization) => {
                                    const organization = infoOrganization.account
                                    return (
                                        <div
                                            key={infoOrganization.publicKey.toBase58()}
                                            className="grid grid-cols-[60%_max-content] w-8/12 justify-between h-32 shadow-md bg-slate-900 shadow-slate-800 text-white rounded-lg p-4 ring-2 hover:ring-4"
                                        >
                                            <Link
                                                passHref
                                                href={{
                                                    pathname: "/organizations/[organization]",
                                                    query: {
                                                        organization: infoOrganization.publicKey.toBase58()
                                                    }
                                                }}
                                                as="/organizations"
                                            >
                                                <a
                                                    className="flex row-start-1 h-full justify-between"
                                                >
                                                    <div
                                                        className="flex flex-col justify-between"
                                                    >
                                                        <h1 className="w-max text-xl font-bold"> {organization.name} </h1>
                                                        <div className="flex -space-x-2">
                                                            {
                                                                !!Object.keys(infoOrganization.users).length &&
                                                                Object.entries(infoOrganization.users)
                                                                    .map(([keyUser, user]) => {

                                                                        return (
                                                                            <div
                                                                                key={keyUser}
                                                                                className="relative flex justify-center items-center h-8 w-8 bg-slate-900 rounded-full ring-1 ring-white"
                                                                                onMouseOver={() => {
                                                                                    setInfoUser({
                                                                                        ...user,
                                                                                        key: `${keyUser}${infoOrganization.publicKey.toBase58()}`
                                                                                    })
                                                                                }}
                                                                                onMouseOut={() => {
                                                                                    setInfoUser()
                                                                                }}
                                                                            >
                                                                                <p className=" text-white font-bold">
                                                                                    {
                                                                                        user.fullName.split(" ").map(sep => {
                                                                                            return (
                                                                                                sep[0]
                                                                                            )
                                                                                        })
                                                                                    }
                                                                                </p>
                                                                                {
                                                                                    infoUser?.key === `${keyUser}${infoOrganization.publicKey.toBase58()}` &&
                                                                                    <div className="absolute text-black font-bold outline-double outline-4 outline-white -top-12 rounded-md bg-slate-500 h-max z-20 p-2">
                                                                                        <p>{infoUser.fullName}</p>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        )
                                                                    })
                                                            }
                                                        </div>
                                                    </div>
                                                    <p className=" self-center">
                                                        {
                                                            `Treasury Ratio ${organization?.ratio / 100}`
                                                        }
                                                    </p>
                                                </a>
                                            </Link>
                                            {
                                                infoOrganization.isMember &&
                                                <ComponentButton
                                                    buttonText="Start a Project"
                                                    buttonStyle="w-max h-full ring-1 hover:ring-2 hover:bg-slate-800 ring-slate-400"
                                                    buttonEvent={() => {
                                                        router.push(
                                                            {
                                                                pathname: "/createproject",
                                                                query: {
                                                                    organization: infoOrganization.publicKey.toBase58()
                                                                },
                                                            },
                                                            "/createproject",
                                                            {
                                                                shallow: true
                                                            }
                                                        )
                                                    }}
                                                />
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </>
                    :
                    <div className="flex flex-col gap-8 w-full">
                        <ComponentButton
                            buttonText="Start Project"
                            buttonStyle="flex flex-col h-32 w-full shadow-md bg-zinc-800 shadow-green-light text-white rounded-lg p-4 gap-8"
                            buttonEvent={() => {
                                router.push("/createproject")
                            }}
                        />
                        <ComponentButton
                            buttonText="Connect your team"
                            buttonStyle="flex flex-col h-32 w-full shadow-md bg-zinc-800 shadow-green-light text-white rounded-lg p-4 gap-8"
                            buttonEvent={() => {
                                router.push("/createorganization")
                            }}
                        />
                    </div>

            }

        </div>
    )
}

export default Organizations