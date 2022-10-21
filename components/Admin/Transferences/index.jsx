import { useEffect, useState } from "react"
import Link from "next/link"
import {
    getDatabase,
    ref,
    query,
    get,
    limitToLast,
    equalTo,
    orderByChild,
} from "firebase/database";
import { getDocs, getDoc, doc, collection, where, query as queryFirestore } from "firebase/firestore"

import { useRouter } from "next/router";
import { useAuth } from "../../../context/auth";
import { list } from "postcss";

const Transferences = () => {
    const db = getDatabase()
    const { user, firestore } = useAuth()
    const [partners, setPartners] = useState({})
    const router = useRouter()
    const [handleDropdown, setHandleDropdown] = useState()
    const [selectPartner, setSelectPartner] = useState()
    const [teams, setTeams] = useState()
    const [selectTeam, setSelectTeam] = useState()


    useEffect(() => {
        if (user) {
            get(ref(db, "teams"))
                .then(res => {
                    setTeams(res.val())
                })
            if (router.query.team && router.query.partner) {
                getPartners(router.query.team, router.query.partner)
            }
        }
    }, [])

    const getPartners = async (team, partner) => {

        const users = await getDocs(queryFirestore(collection(firestore, "users"), where("team", "array-contains", team)))
        let listPartners = {}
        users.forEach(user => {
            listPartners = {
                [user.id]: {
                    fullName: user.data().fullName
                }
            }
        })

        const listPartnerWithdrawals = Object.entries(listPartners).map(async ([keyUser, user]) => {
            const withdrawals = await get(query(ref(db, `withdrawals/${keyUser}`), limitToLast(10)))
            return ({
                [keyUser]: {
                    withdrawals: withdrawals.val(),
                    fullName: user.fullName
                }
            })
        })

        Promise.all(listPartnerWithdrawals)
            .then(res => {
                setSelectPartner(partner || false)
                setSelectTeam(team)
                setPartners(...res)
            })
    }

    return (
        <div className="grid grid-cols-[max-content_max-content_auto] grid-rows-[min-content_min-content] w-11/12 gap-4 pb-4">
            <h2 className="row-start-1 row-end-2 col-start-1 col-end-2 font-bold">Grupos</h2>
            <h2 className="row-start-1 row-end-2 col-start-2 col-end-3 font-bold">Socios</h2>
            <ul className="flex flex-col row-start-2 row-end-3 col-start-1 col-end-2 gap-4 w-48s">
                {
                    teams &&
                    Object.entries(teams).map(([key, team]) => {

                        return (
                            <li
                                key={key}
                                onClick={() => getPartners(key)}
                                className=" flex w-full items-center justify-between first:border-t-0 border-t-2 border-gray"
                            >
                                <p className=" w-11/12 text-xl font-semibold ">{team.businessName}</p>
                                {
                                    selectTeam === key ?
                                        <div className=" -rotate-45 border-r-2 border-b-2 border-black h-2 w-2"></div>
                                        :
                                        undefined
                                }
                            </li>
                        )
                    })
                }
            </ul>
            <ul className="flex flex-col row-start-2 row-end-3 col-start-2 col-end-3 gap-4 w-48">
                {
                    partners && Object.entries(partners).map(([keyPartner, partner]) => {
                        if (Object.entries(partner.withdrawals).length > 0) {
                            return (
                                <li
                                    className="flex w-full items-center justify-between first:border-t-0 border-t-2 p-4 border-gray-400"
                                    onClick={() => setSelectPartner(selectPartner !== keyPartner ? keyPartner : undefined)}
                                >
                                    <p className=" w-11/12 text-lg font-medium text-ellipsis">{partner.fullName}</p>
                                    {
                                        selectPartner === keyPartner ?
                                            <div className=" -rotate-45 border-r-2 border-b-2 border-black h-2 w-2"></div>
                                            :
                                            undefined
                                    }

                                </li>
                            )
                        }
                    })
                }
            </ul>

            <table className="row-start-2 row-end-3 col-start-3 col-end-4 w-auto text-center overflow-y-auto">
                <thead className="table table-fixed w-full border-y-2 border-slate-200">
                    <tr className="h-8">
                        <th>Fecha</th>
                        <th>Monto Pedido</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody
                    className="block h-[50vh] overflow-y-scroll scrollbar"
                >
                    {
                        selectPartner && Object.entries(partners[selectPartner].withdrawals).length > 0 &&

                        Object.entries(partners[selectPartner].withdrawals).map(([key, withdrawals]) => {
                            return (
                                <tr
                                    key={key}
                                    className="table w-full  table-fixed first:border-t-0 border-t-2 border-slate-100 h-min"
                                    onClick={() =>
                                        router.push({
                                            pathname: `/admin/transferences/[id]`,
                                            query: { id: key, u: selectPartner },
                                        },
                                            "/admin/transferences",
                                            {
                                                shallow: true
                                            }
                                        )
                                    }
                                >
                                    <td className="h-min py-4">
                                        <p>{withdrawals?.date}</p>
                                    </td>
                                    <td className="h-min py-4">
                                        <p>{
                                            withdrawals?.currency &&
                                            `${withdrawals?.amount.toLocaleString('es-ar', { style: 'currency', currency: withdrawals?.currency, minimumFractionDigits: 2 })}`
                                        }
                                        </p>
                                    </td>
                                    <td className="h-8 py-4">
                                        <p>{withdrawals?.status ? "Confirmado" : "Pendiente"}</p>
                                    </td>
                                </tr>
                            )
                        }).reverse()
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Transferences

