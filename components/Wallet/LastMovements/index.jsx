import { useState, useEffect } from 'react'

import { getDatabase, get, ref, onValue, limitToLast, query, update } from "firebase/database";

import { useAuth } from '../../../context/auth';

const LastMovements = () => {
    const db = getDatabase()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [lastMovements, setLastMovements] = useState([])
    useEffect(() => {
        if(user){
            const salarysettlement = new Promise((resolve, rej) => {
                get(query(ref(db, `salarysettlement/${user?.uid}`), limitToLast(3)))
                    .then(getIncomes => {
                        if (getIncomes.hasChildren()) {
                            const objIncomes = Object.entries(getIncomes.val()).map(([key, value]) => {
                                const { amount, date, createdAt, currency } = value
                                const localeDate = new Date(date).toLocaleDateString('es-ar')
                                return { currency, amount, localeDate, type: "Ingreso", createdAt, color: "secondary-color" }
                            });
                            return objIncomes
                        }
                    })
                    .then(res => {
                        resolve(res)
                    })
            })
            const withdrawals = new Promise((resolve, rej) => {
                get(query(ref(db, `withdrawals/${user?.uid}`), limitToLast(3)))
                    .then(getWithdrawals => {
                        if (getWithdrawals.hasChildren()) {
                            const objWith = Object.entries(getWithdrawals.val()).map(([key, value]) => {
                                const { amount, date, createdAt, currency } = value
                                const localeDate = new Date(date).toLocaleDateString('es-ar')
                                return { currency, amount, localeDate, type: "Retiro", createdAt, color: "primary-color" }
                            });
                            return objWith
                        }
                    })
                    .then(res => {
                        resolve(res)
                    })
            })
            const invoiceDiscount = new Promise((resolve, rej) => {
                get(query(ref(db, `invoiceDiscount/${user?.uid}`), limitToLast(3)))
                    .then(getInvoiceDiscount => {
                        if (getInvoiceDiscount.hasChildren()) {
                            const objInvDis = Object.entries(getInvoiceDiscount.val()).map(([key, value]) => {
                                const { amount, date, createdAt, currency } = value
                                const localeDate = new Date(date).toLocaleDateString('es-ar')
                                return { currency, amount, localeDate, type: "Factura de tercero", createdAt, color: "tertiary-color" }
                            })
                            return objInvDis
                        }
                    })
                    .then(res => {
                        resolve(res)
                    })
            })
            Promise.all([salarysettlement, withdrawals, invoiceDiscount])
                .then(res => {
                    const merged = res.reduce((acc, arr) => {
                        if (arr) {
                            return acc.concat(arr)
                        }
                        return acc
                    }, [])
                    merged.sort((a, b) => {
                        if (a.createdAt > b.createdAt) {
                            return -1
                        }
                        if (a.createdAt < b.createdAt) {
                            return 1
                        }
                        return 0
                    })
                    setLastMovements(merged)
                    setLoading(false)
                })
        }
    }, [user])

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="animate-spin flex  border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
        </div>
    )
    return (
        <div className="flex flex-col w-8/12 items-center gap-4">
            <p className="text-left font-semibold text-white w-4/5">Ultimos Movimientos</p>
            {
                lastMovements.length > 0 ?
                <table className="w-full text-center">
                    <tbody>
                        {
                            lastMovements?.map((move, index) => {
                                return (
                                    <tr className={`${move.type === "Retiro" && "shadow-primary-color"} ${move.type === "Ingreso" && "shadow-secondary-color"} ${move.type === "Factura de tercero" && "shadow-tertiary-color"} h-20 shadow-sm font-semibold`} key={index} >
                                        <td>{move.localeDate}</td>
                                        <td>{move?.type}</td>
                                        <td>{move?.currency && move?.amount.toLocaleString('es-ar', { style: 'currency', currency: move.currency, minimumFractionDigits: 2 })}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
                :
                <h4>No tuvo movimientos por el momento.</h4>
            }
        </div>
    )
}

export default LastMovements