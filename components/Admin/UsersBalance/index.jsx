import { useState, useEffect } from "react"
import {
    getDatabase,
    ref,
    get,
    orderByChild,
    query,
    equalTo,
    update,
    push,
    set,
    serverTimestamp,
    startAt
} from "firebase/database";
import { getDocs, getDoc, doc, collection, where, query as queryFirestore } from "firebase/firestore"

import { useAuth } from "../../../context/auth"
import { useHost } from "../../../context/host";
import { sendEmail } from "../../../functions/sendMail"


const UsersBalance = () => {
    const db = getDatabase()
    const { user, firestore } = useAuth()
    const { host } = useHost()
    const [users, setUsers] = useState()
    const [teams, setTeams] = useState()
    const [loading, setLoading] = useState({
        user: false,
        listUsers: false
    })
    const [userSelect, setUserSelect] = useState()
    const [changeBalance, setChangeBalance] = useState({
        type: "INTERNAL_SETTLEMENT",
        currency: "",
        amount: 0,
        name: ""
    })

    useEffect(() => {
        if (user) {
            get(ref(db, "teams"))
                .then(res => {
                    setTeams(res.val())
                    setUsers(undefined)
                })
        }
    }, [db, user])

    const getListUsers = (team) => {
        getDocs(queryFirestore(collection(firestore, "users"), where("team", "array-contains", team)))
            .then(res => {
                let users = {}
                res.forEach(user => {
                    users = {
                        [user.id]: user.data()
                    }
                })
                setUsers(users)
                setUserSelect(undefined)
                setLoading({
                    ...loading,
                    listUsers: false
                })
            })
    }

    const handleUser = async (keyUser, user) => {
        const dateNow = Date.now()

        let objUser = {
            key: keyUser,
            name: user.name,
            email: user.email,
            balance: {},
            scheduledIncome: {
                ARS: 0,
                USD: 0
            },
            withdrawals: {
                amount: {
                    USD: 0,
                    ARS: 0
                },
                data: []
            },
            invoiceDiscount: {
                data: []
            },
            projectCount: {
                USD: 0,
                ARS: 0
            },
            currencyConversion: {

                data: []
            },
            salarySettlement: {
                amount: {
                    USD: 0,
                    ARS: 0
                },
                data: []
            }
        }
        const resBalance = await get(query(ref(db, `/balance/${keyUser}`)))
        const balance = resBalance.val()
        const resProyectToUsers = await get(query(ref(db, `users/${keyUser}/projects`)))
        const projectsToUser = resProyectToUsers.val()
        const resWithdrawals = await get(query(ref(db, `/withdrawals/${keyUser}`), orderByChild("createdAt"), startAt(Date.now() - 31557600000)))
        const withdrawals = resWithdrawals.val()
        const resCurrencyConversion = await get(query(ref(db, `/currencyconversion/${keyUser}`), orderByChild("createdAt"), startAt(Date.now() - 31557600000)))
        const currencyConversion = resCurrencyConversion.val()
        const resSalarySettlement = await get(query(ref(db, `/salarysettlement/${keyUser}`), orderByChild("createdAt"), startAt(Date.now() - 31557600000)))
        const salarySettlement = resSalarySettlement.val()
        const resInvoiceDiscount = await get(query(ref(db, `/invoiceDiscount/${keyUser}`), orderByChild("createdAt"), startAt(Date.now() - 31557600000)))
        const invoiceDiscount = resInvoiceDiscount.val()

        if (resSalarySettlement.hasChildren()) {
            Object.values(salarySettlement).forEach(SS => {
                objUser = {
                    ...objUser,
                    salarySettlement: {
                        data: [
                            ...objUser.salarySettlement.data,
                            {
                                date: new Date(SS.date).toLocaleDateString('es-ar'),
                                type: "Liquidación",
                                status: true,
                                currency: SS.currency,
                                createdAt: SS.createdAt,
                                amount: SS.amount,
                                currency: SS.currency
                            }
                        ],

                    }
                }
            })
        }
        if (resCurrencyConversion.hasChildren()) {
            Object.values(currencyConversion).forEach(CC => {
                objUser = {
                    ...objUser,
                    currencyConversion: {
                        data: [
                            ...objUser.currencyConversion.data,
                            {
                                date: new Date(CC.date).toLocaleDateString('es-ar'),
                                type: "Conversion de Moneda",
                                currency: CC.currency,
                                status: CC.status,
                                createdAt: CC.createdAt,
                                amount: CC.amount,
                                currency: CC.currency

                            }],
                    }
                }
            })
        }
        if (resInvoiceDiscount.hasChildren()) {
            Object.values(invoiceDiscount).forEach((invDiscount) => {
                objUser = {
                    ...objUser,
                    invoiceDiscount: {
                        data: [
                            ...objUser.invoiceDiscount.data,
                            {
                                date: new Date(invDiscount.date).toLocaleDateString('es-ar'),
                                type: "Factura de terceros",
                                currency: invDiscount.currency,
                                status: invDiscount.status,
                                createdAt: invDiscount.createdAt,
                                amount: invDiscount.amount
                            }
                        ]
                    },
                    withdrawals: {
                        ...objUser.withdrawals,
                        amount: (
                            invDiscount.currency === "USD" && invDiscount.createdAt <= dateNow - 31557600000 ?
                                {
                                    ...objUser.withdrawals.amount,
                                    USD: invDiscount.amount + objUser.withdrawals.amount.USD
                                }
                                :
                                {
                                    ...objUser.withdrawals.amount,
                                    ARS: invDiscount.amount + objUser.withdrawals.amount.ARS
                                }
                        )

                    }
                }
            })
        }
        if (resWithdrawals.hasChildren()) {
            Object.values(withdrawals).forEach((withdraw) => {
                objUser = {
                    ...objUser,
                    withdrawals: {
                        data: [
                            ...objUser.withdrawals.data,
                            {
                                date: new Date(withdraw.date).toLocaleDateString('es-ar'),
                                type: "Retiro",
                                currency: withdraw.currency,
                                status: withdraw.status,
                                createdAt: withdraw.createdAt,
                                amount: withdraw.amount
                            }
                        ],
                        amount: (
                            withdraw.currency === "USD" && withdraw.createdAt <= dateNow - 31557600000 ?
                                {
                                    ...objUser.withdrawals.amount,
                                    USD: withdraw.amount + objUser.withdrawals.amount.USD
                                }
                                :
                                {
                                    ...objUser.withdrawals.amount,
                                    ARS: withdraw.amount + objUser.withdrawals.amount.ARS
                                }
                        )
                    }
                }
            })
        }
        if (resProyectToUsers.hasChildren()) {
            const allAmountPrj = Object.entries(projectsToUser).map(async ([key, value]) => {
                const getPrj = await get(query(ref(db, `projects/${key}`)))
                if (getPrj.val().currency === "USD") {
                    objUser = {
                        ...objUser,
                        projectCount: {
                            ...objUser.projectCount,
                            USD: objUser.projectCount.USD + 1
                        }
                    }
                }
                if (getPrj.val().currency === "ARS") {
                    objUser = {
                        ...objUser,
                        projectCount: {
                            ...objUser.projectCount,
                            ARS: objUser.projectCount.ARS + 1
                        }
                    }
                }
                const status = ["CONVOCATORIA", "REVISION_PARTNER", "LIQUIDADO"]
                if (!status.find(sts => sts === getPrj?.val()?.status)) {
                    if (value.amount > value.salarysettlement && value.salarysettlement) {
                        if (getPrj.val().currency === "USD") {
                            return { USD: value.amount - value.salarysettlement }
                        } else if (getPrj.val().currency === "ARS") {
                            return { ARS: value.amount - value.salarysettlement }
                        }
                    } else {
                        if (getPrj.val().currency === "USD") {
                            return { USD: value.amount }
                        } else if (getPrj.val().currency === "ARS") {
                            return { ARS: value.amount }
                        }
                    }
                }
            })

            const amountCurrency = await Promise.all(allAmountPrj)
            amountCurrency.forEach(currency => {
                if (currency) {

                    if (currency.USD) {
                        objUser = {
                            ...objUser,
                            scheduledIncome: {
                                ...objUser.scheduledIncome,
                                USD: objUser.scheduledIncome.USD + currency.USD
                            }
                        }
                    } else if (currency.ARS) {
                        objUser = {
                            ...objUser,
                            scheduledIncome: {
                                ...objUser.scheduledIncome,
                                ARS: objUser.scheduledIncome.ARS + currency.ARS
                            }
                        }
                    }
                }
            })
        }
        const concatTable = objUser.currencyConversion.data.concat(objUser.withdrawals.data, objUser.salarySettlement.data, objUser.invoiceDiscount.data)
        const sortTable = concatTable.sort((a, b) => {

            if (a.createdAt > b.createdAt) {
                return -1
            }
            if (a.createdAt < b.createdAt) {
                return 1
            }
            return 0
        })
        objUser = {
            ...objUser,
            balance: balance,
            table: sortTable
        }
        setLoading({
            ...loading,
            user: false
        })
        setUserSelect(objUser)
    }
    const handlerChangeBalance = (e) => {
        if (e.target.name === "amount") {
            setChangeBalance({
                ...changeBalance,
                [e.target.name]: Number(e.target.value)
            })
        } else {
            setChangeBalance({
                ...changeBalance,
                [e.target.name]: e.target.value
            })
        }
    }
    const confirmChangeBalance = async () => {
        setLoading({
            ...loading,
            user: true
        })
        const newDate = new Date();
        newDate.setMonth(newDate.getMonth() + 1);
        const date = [
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
        ].join("-");
        const resBalance = await get(ref(db, `/balance/${userSelect.key}`))
        const balance = resBalance.val()

        if (changeBalance.type === "INTERNAL_SETTLEMENT") {
            const resClient = await get(query(ref(db, `/clients`), orderByChild("clientName"), equalTo(changeBalance.currency === "USD" ? "CooperativaMentalFL" : "CooperativaMentalBA")))
            const client = Object.entries(resClient.val()).map(([key, cli]) => {
                return {
                    [key]: {
                        clientName: cli.clientName
                    }
                }
            })
            update(ref(db, `/balance/${userSelect.key}`),
                (
                    changeBalance.currency === "USD" ?
                        {
                            balanceUSD: balance.balanceUSD + changeBalance.amount
                        }
                        :
                        {
                            balance: balance.balance + changeBalance.amount
                        }
                )
            )
            const SalarySettlementRef = ref(db, "salarysettlement/" + userSelect.key);
            const pushSalarySettlement = push(SalarySettlementRef);
            set(pushSalarySettlement, {
                client: client[0],
                nameProject: changeBalance.name,
                amount: changeBalance.amount,
                name: userSelect.name,
                date: date,
                currency: changeBalance.currency,
                createdAt: serverTimestamp(),
            })
                .then(
                    res => {
                        const cliName = Object.values(client[0]).map(cli => cli.clientName)
                        const pushNoti = push(ref(db, `notifications/${userSelect.key}`))

                        set(pushNoti,
                            {
                                type: "LIQUIDADO",
                                salarysettlement: changeBalance.amount,
                                client: cliName[0],
                                nameProject: changeBalance.name,
                                viewed: false,
                                open: false,
                                showCard: false,
                                currency: changeBalance.currency,
                                createdAt: serverTimestamp()
                            }
                        ).then(res => {
                            sendEmail({
                                from: {
                                    email: user.email,
                                    name: user.name
                                },
                                to: {
                                    email: userSelect.email,
                                    name: userSelect.name
                                },
                                subject: `Nueva Liquidación`,
                                redirect: `${host}/wallet`,
                                text: [
                                    `Se acreditó tu liquidación de ${changeBalance.currency} ${changeBalance.amount}`,
                                    `del proyecto ${changeBalance.name} de ${client[0]}`
                                ],
                            })
                        })
                    }
                )
        } else {
            if (
                (changeBalance.currency === "ARS" && changeBalance.amount > balance.balance) ||
                (changeBalance.currency === "USD" && changeBalance.amount > balance.balanceUSD)
            ) {
                update(ref(db, `/balance/${userSelect.key}`),
                    (
                        changeBalance.currency === "USD" ?
                            {
                                balanceUSD: balance.balanceUSD - (changeBalance.amount + 0)
                            }
                            :
                            {
                                balance: balance.balance - (changeBalance.amount + 0)
                            }
                    )
                )
            } else {
                update(ref(db, `/balance/${userSelect.key}`),
                    (
                        changeBalance.currency === "USD" ?
                            {
                                balanceUSD: balance.balanceUSD - changeBalance.amount
                            }
                            :
                            {
                                balance: balance.balance - changeBalance.amount
                            }
                    )
                )
            }
            const SalarySettlementRef = ref(db, "invoiceDiscount/" + userSelect.key);
            const pushSalarySettlement = push(SalarySettlementRef);
            set(pushSalarySettlement, {
                businessName: changeBalance.name,
                amount: changeBalance.amount,
                name: userSelect.name,
                date: date,
                currency: changeBalance.currency,
                createdAt: serverTimestamp(),
            })
                .then(
                    res => {
                        const pushNoti = push(ref(db, `notifications/${userSelect.key}`))
                        set(pushNoti,
                            {
                                type: "INVOICE_DISCOUNT",
                                amount: changeBalance.amount,
                                currency: changeBalance.currency,
                                name: changeBalance.name,
                                viewed: false,
                                open: false,
                                showCard: false,
                                createdAt: serverTimestamp()
                            }
                        ).then(res => {
                            sendEmail({
                                from: {
                                    email: user.email,
                                    name: user.name
                                },
                                to: {
                                    email: userSelect.email,
                                    name: userSelect.name
                                },
                                subject: "Descuento factura de terceros",
                                redirect: `${host}/wallet`,
                                text: [
                                    `${userSelect.name}`,
                                    `Se le ha descontado un total de ${changeBalance.currency} ${changeBalance.amount}`,
                                    `correspondiente a la factura de terceros, emitida a ${changeBalance.name}`,
                                ],
                            })
                        })
                    }
                )
        }
        handleUser(userSelect.key, { name: userSelect.name, email: userSelect.email })
        setChangeBalance({
            type: "INTERNAL_SETTLEMENT",
            currency: "",
            amount: 0,
            name: ""
        })
    }


    return (
        <div className=" flex  flex-col items-center w-11/12 mt-4">
            <select
                defaultValue={0}
                onChange={(e) => {
                    getListUsers(e.target.value)
                    setLoading({
                        ...loading,
                        listUsers: true
                    })
                }}
                className={`flex bg-zinc-800 w-full border rounded-xl h-16 p-4 text-xl shadow-sm mb-4`}
            >
                <option value={0} disabled>Seleccione el Grupo</option>
                {
                    teams && Object.entries(teams).map(([key, team]) => {

                        return (
                            <option
                                key={key}
                                value={key}
                            >
                                {team.businessName}
                            </option>
                        )
                    })
                }
            </select>


            {
                users &&
                <div className=" grid grid-cols-[10rem_auto] gap-4 grid-rows-[auto_auto] w-full pb-4">

                    <div>
                        <p className=" text-lg font-semibold">Lista de Socios</p>
                    </div>
                    <>


                        {
                            loading.listUsers ?
                                <div className="flex col-start-1 col-end-2 row-start-2 row-end-3 w-9/12 justify-center h-40">
                                    <div className="animate-spin flex  border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 " />
                                </div>
                                :
                                <div className="h-full col-start-1 col-end-2 row-start-2 row-end-3">
                                    <ul className=" flex flex-col gap-4 ">
                                        {
                                            users && Object.entries(users).map(([key, user]) => {
                                                return (
                                                    <li
                                                        key={key}
                                                        onClick={() => {
                                                            handleUser(key, user)
                                                            setLoading({
                                                                ...loading,
                                                                user: true
                                                            })
                                                        }}
                                                        className="first:border-t-0 border-t-2"
                                                    >
                                                        {user.name}
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                        }
                        <div className="h-10 col-start-2 col-end-3 ml-8">
                            <h4 className="ml-8 text-3xl font-medium">
                                {
                                    userSelect && userSelect.name
                                }
                            </h4>
                        </div>
                        {
                            loading.user ?
                                <div className="flex col-start-2 row-start-2 col-end-2 row-end-3 w-9/12 justify-center h-40">
                                    <div className="animate-spin flex  border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 " />
                                </div>
                                :
                                userSelect?.key &&
                                <div className=" col-start-2 row-start-2 my-8 w-full justify-center items-center gap-2">
                                    <div className="flex gap-2 flex-wrap">
                                        <div className="col-start-2 col-end-3 ml-4">
                                            <div className="grid grid-cols-[min-content_min-content] grid-rows-[min-content_min-content] gap-8 text-center justify-around">
                                                <div className="flex gap-4 items-center h-10">
                                                    <p className=" text-sm w-20 text-center">Saldo Disponible</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">{userSelect?.balance?.balance.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 }) || 0}</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">{userSelect?.balance?.balanceUSD.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 }) || 0}</p>
                                                </div>
                                                <div className="flex gap-4 w-max items-center">
                                                    <p className=" text-sm w-24 text-center">Suma de Retiros (ultimos 12 meses)</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">{userSelect?.withdrawals?.amount?.ARS.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 }) || 0}</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">{userSelect?.withdrawals?.amount?.USD.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 }) || 0}</p>
                                                </div>
                                                <div className="flex gap-4 items-center h-10">
                                                    <p className=" text-sm w-20 text-center">Ingresos Programados</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">{userSelect?.scheduledIncome?.ARS.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 }) || 0}</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">{userSelect?.scheduledIncome?.USD.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 }) || 0}</p>
                                                </div>
                                                <div className="flex gap-4 w-max items-center">
                                                    <p className=" text-sm w-24 text-center">Proyectos (ultimos 12 meses)</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">US$ / {userSelect?.projectCount?.ARS || 0}</p>
                                                    <p className=" text-2xl w-36 min-w-min font-semibold">AR$ / {userSelect?.projectCount?.USD || 0}</p>
                                                </div>
                                            </div>
                                            {
                                                userSelect?.key &&
                                                <div className="flex my-8 w-full justify-center items-center gap-2">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <div className="flex flex-col font-semibold h-14 justify-end">
                                                            <label className="text-xs" htmlFor="type">Liquidación interna / Descuento de Factura</label>
                                                            <select defaultValue={0} onChange={handlerChangeBalance} name="type" id="type" className=" h-8  border-2 border-[#5f5f5f80] bg-white rounded-lg text-xl px-4 shadow-md shadow-[#9c9c9d] ">
                                                                <option value={0} disabled>Selecciona una opción</option>
                                                                <option value="INTERNAL_SETTLEMENT">Liquidación Interna</option>
                                                                <option value="INVOICE_DISCOUNT">Descuento de Factura</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col font-semibold h-14 justify-end">
                                                            <label className="text-xs" htmlFor="currency">Moneda</label>
                                                            <select defaultValue={0} onChange={handlerChangeBalance} name="currency" id="currency" className=" h-8  border-2 border-[#5f5f5f80] bg-white rounded-lg text-xl px-4 shadow-md shadow-[#9c9c9d] ">
                                                                <option value={0} disabled>Selecciona una moneda</option>
                                                                <option value="USD">US$</option>
                                                                <option value="ARS">AR$</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col font-semibold h-14 justify-end">
                                                            <label className="text-xs" htmlFor="amount">{changeBalance.type === "INTERNAL_SETTLEMENT" ? "Importe" : "Importe sin IVA"}</label>
                                                            <input onChange={handlerChangeBalance} type="number" id="amount" name="amount" className=" h-8 border-2 border-[#5f5f5f80] bg-white rounded-lg text-xl px-4 shadow-md shadow-[#9c9c9d] " />
                                                        </div>
                                                        <div className="flex flex-col font-semibold h-14 justify-end">
                                                            <label className="text-xs" htmlFor="name">{changeBalance.type === "INTERNAL_SETTLEMENT" ? "Proyecto" : "Razon Social"}</label>
                                                            <input onChange={handlerChangeBalance} type="text" id="name" name="name" className=" h-8 border-2 border-[#5f5f5f80] bg-white rounded-lg text-xl px-4 shadow-md shadow-[#9c9c9d] " />
                                                        </div>
                                                    </div>
                                                    <button onClick={confirmChangeBalance} className=" rounded-lg border-0 bg-[#5A31E1] text-white text-2xl font-semibold text-center capitalize w-max h-min p-2 m-4">Confirmar</button>
                                                </div>
                                            }
                                            <table className="table w-full table-fixed border-y-2 mt-4">
                                                <tbody
                                                    className="block h-60 overflow-y-auto scrollbar"
                                                >
                                                    {
                                                        userSelect?.table?.map(movements =>

                                                            <tr
                                                                key={movements.createdAt}
                                                                className="table w-full table-fixed text-center border-y-2"
                                                            >
                                                                <td className=" font-semibold h-6">
                                                                    {movements.date}
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <p className=" font-semibold h-6">
                                                                            {movements?.type}
                                                                        </p>
                                                                        <p className=" text-sm">
                                                                            {
                                                                                movements?.status ?
                                                                                    "Finalizado" :
                                                                                    "En proceso"
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                                <td className="font-semibold h-4">
                                                                    {
                                                                        movements.currency === "ARS" &&
                                                                        movements.amount.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 })
                                                                    }
                                                                </td>
                                                                <td className=" font-semibold h-6">
                                                                    {
                                                                        movements.currency === "USD" &&
                                                                        movements.amount.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 })
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                        }

                    </>
                </div>
            }

        </div>
    )
}

export default UsersBalance