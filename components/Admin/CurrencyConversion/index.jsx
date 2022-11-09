import { useEffect, useState } from "react"
import { useRouter } from "next/router"

import {
    getDatabase,
    ref,
    query,
    get,
    limitToLast,
    equalTo,
    orderByChild,
} from "firebase/database";
import { useAuth } from "../../../context/auth"

const ListCurrencyConversion = () => {
    const db = getDatabase()
    const router = useRouter()
    const { user } = useAuth()
    const [partners, setPartners] = useState({})
    const [selectPartner, setSelectPartner] = useState()

    useEffect(() => {
        if (user) {
            get(ref(db, `users`)).then(res => {
                const listPartnerStatus = Object.entries(res.val()).map(async ([key, partner]) => {
                    const listCurrencyConversion = await get(query(ref(db, `currencyconversion/${key}`), limitToLast(10)))
                    let listLocaleDate = {}
                    if (listCurrencyConversion.val()) {
                        Object.entries(listCurrencyConversion.val()).forEach(([keyCurrencyConversion, value]) => {
                            const localeDate = new Date(value.date).toLocaleDateString()
                            listLocaleDate = {
                                ...listLocaleDate,
                                [keyCurrencyConversion]: {
                                    ...value,
                                    date: localeDate
                                }
                            }

                        }
                        )
                        return [
                            key,
                            {
                                currencyConversion: {
                                    ...listLocaleDate
                                },
                                name: partner.name,
                            }
                        ]
                    }
                })
            })
        }

    }, [db.user])

    return (
        <div className="h-full grid grid-cols-[min-content_min-content_auto] grid-rows-[min-content_min-content] w-11/12" >
            <h2 className="h-8 row-start-1 row-end-2 col-start-2 col-end-3 font-bold text-center">Socios</h2>
            <ul className="flex flex-col border-2 border-slate-200 gap-4 row-start-2 row-end-3 col-start-2 col-end-3 h-min w-48">
                {
                    partners && Object.entries(partners).map(([keyPartner, partner]) => {
                        if (Object.entries(partner.currencyConversion).length > 0) {
                            return (
                                <li
                                    className="flex w-full items-center justify-between first:border-t-0 border-t-2 p-4 border-gray"
                                    onClick={() => setSelectPartner(selectPartner !== keyPartner ? keyPartner : undefined)}
                                >
                                    <p className=" w-11/12 text-lg font-medium text-ellipsis">{partner.name}</p>
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
                    <tr>
                        <th>Fecha</th>
                        <th>Monto Pedido</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody
                    className="block h-[50vh] overflow-y-scroll scrollbar"
                >
                    {
                        selectPartner && Object.entries(partners[selectPartner].currencyConversion).length > 0 &&

                        Object.entries(partners[selectPartner].currencyConversion).map(([key, currencyConversion]) => {
                            return (
                                <tr
                                    key={key}
                                    className="table w-full  table-fixed first:border-t-0 border-t-2 border-slate-100 h-min"
                                    onClick={() =>
                                        router.push({
                                            pathname: `/admin/currencyconversion/[id]`,
                                            query: { id: key, u: selectPartner },
                                        },
                                            "/admin/currencyconversion",
                                            {
                                                shallow: true
                                            }
                                        )
                                    }
                                >
                                    <td className="h-min py-4">
                                        <p>{currencyConversion?.date}</p>
                                    </td>
                                    <td className="h-min py-4">
                                        <p>{
                                            currencyConversion?.currency &&
                                            `${currencyConversion?.amount.toLocaleString('es-ar', { style: 'currency', currency: currencyConversion?.currency, minimumFractionDigits: 2 })}`
                                        }
                                        </p>
                                    </td>
                                    <td className="h-min py-4">
                                        <p>{currencyConversion?.status ? "Confirmado" : "Pendiente"}</p>
                                    </td>
                                </tr>
                            )
                        }).reverse()
                    }
                </tbody>
            </table>

        </div >
    )
}

export default ListCurrencyConversion