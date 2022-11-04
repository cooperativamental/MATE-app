import { useState, useEffect } from "react"

import {
    getDatabase,
    ref,
    update,
    set,
    push,
    get,
    serverTimestamp
  
  } from "firebase/database"

import ComponentButton from "../../Elements/ComponentButton"

export const InvoiceOrder = ({ project, team, keyProject }) => {
    const db = getDatabase()
    const [dateState, setDateState] = useState()
    const [dateInvoiceOrder, setDateInvoiceOrder] = useState({
        date: "",
        status: false
    })
    const [errors, setError] = useState({
        date: true,
        percentage: true
    })

    useEffect(() => {
        if (project?.amountToInvoice) {
            setDateInvoiceOrder(
                {
                    ...dateInvoiceOrder,
                    status: Math.round(project?.amountToInvoice - (project?.totalBruto / project?.percentage))
                }
            )
        } else {
            setDateInvoiceOrder(
                {
                    ...dateInvoiceOrder,
                    status: Math.round(project?.totalBruto - (project?.totalBruto / project?.percentage)) === 0
                }
            )
        }
    }, [project])

    const handlerDate = (e) => {
        const newDate = new Date()
        newDate.setMonth(newDate.getMonth() + 1);
        newDate.setDate(newDate.getDate() + Number(e.target.value));

        const date = [
            newDate.getFullYear(),
            newDate.getMonth() < 10 ? "0" + newDate.getMonth() : newDate.getMonth(),
            newDate.getDate() < 10 ? "0" + newDate.getDate() : newDate.getDate(),
        ].join("-");
        setDateState(e.target.value)
        setDateInvoiceOrder({
            ...dateInvoiceOrder,
            date: date,
        })
        setError({
            ...errors,
            date: false
        })
    }

    const confirmInvoice = () => {
        const fnAmountToInvoice = () => {
            if (!project?.amountToInvoice) {
                return (project?.totalBruto - (project?.totalBruto / project.percentage))
            } else if (project?.amountToInvoice > project?.totalBruto / project.percentage) {
                return (Math.round(project?.amountToInvoice - (project?.totalBruto / 3)))
            } else {
                return (project?.amountToInvoice - (project?.totalBruto / project.percentage))
            }
        }

        const invoice_call = {
            status: "INVOICE_ORDER",
            amountToInvoice: fnAmountToInvoice(),
            invoiceDate: dateInvoiceOrder.date,
            textEmail: (txt) => {
                return ({
                    text: [`Fue facturado el  proyecto ${txt?.nameProject}`],
                    subject: `El proyecto ${txt?.nameProject} facturado`
                })
            }
        }
        const { textEmail, ...resObj } = invoice_call

        update(ref(db, `projects/${keyProject}`), resObj)
            .then(res => {
                get(ref(db, `users/`)).then(res => {
                    const resValue = res.val()
                    Object.entries(resValue).forEach(([key, valueUser]) => {
                        if (Object.keys(project.projectHolder).map(key => key)[0] === key) {
                            const pushNoti = push(ref(db, `notifications/${Object.keys(project.projectHolder).map(key => key)[0]}`))
                            set(pushNoti,
                                {
                                    type: invoice_call.status,
                                    projectID: keyProject,
                                    client: Object.values(project.client).map(client => client.clientName),
                                    nameProject: project.nameProject,
                                    percentage: project.percentage,
                                    viewed: false,
                                    team: team,
                                    open: false,
                                    showCard: false,
                                    createdAt: serverTimestamp()
                                }
                            )
                                .then(res => {
                                    sendEmail({
                                        ...invoice_call.textEmail({
                                            nameProject: project.nameProject,
                                        }),
                                        from: {
                                            name: user.name,
                                            email: user.email
                                        },
                                        to: {
                                            ...Object.values(project.projectHolder)
                                                .map(values => ({
                                                    name: values.name,
                                                    email: values.email
                                                }))[0]
                                        },
                                        redirect: `${host}`
                                    })
                                    router.push({
                                        pathname: router.pathname,
                                        query: {
                                            team: team
                                        }
                                    })
                                })
                        }
                    })
                })
            })
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Pedido de Facturación</h2>
            <div className="flex font-bold justify-between text-lg w-full">
                <p>Titular de Proyecto: </p>
                <p>{project?.projectHolder && Object.values(project?.projectHolder).map(val => val.name)}</p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />

            <div className="flex w-full justify-between font-bold text-lg">
                <p>Total Bruto: </p>
                <p>{project?.totalBruto?.toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })}</p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />
            <div className="flex justify-between text-lg w-full">
                <p>Nombre de Proyecto: </p>
                <p>{project?.nameProject}</p>
            </div>
            <div className="flex justify-between text-lg w-full">
                <p>Porcentaje a facturar: </p>
                {
                    project?.percentage === 1 ?
                        <p>100%</p> :
                        project?.percentage === 2 ?
                            <p>50%</p> :
                            <p>Un Tercio</p>
                }
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />

            <div className="flex justify-between text-lg w-full">
                <p>Quedara por facturar un total de: </p>
                <p>
                    {
                        project?.amountToInvoice
                            ?
                            Math.round(project?.amountToInvoice - (project?.totalBruto / project?.percentage)).toFixed(2)
                            :
                            project && Math.round(project?.totalBruto - (project?.totalBruto / project?.percentage))
                                .toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })
                    }
                </p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />
            {
                dateInvoiceOrder?.status &&
                <div className="flex w-full flex-col gap-4">
                    <h4 htmlFor="INVOICE_DATE_ORDER">Por favor introduzca una fecha de estimada de pago a los socios.</h4>
                    <div className="flex font-bold gap-8">
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="sevendays"
                                id="sevendays"
                                value={7}
                                onChange={handlerDate}
                                checked={dateState === "7"}
                            />
                            <label htmlFor="sevendays">Siete Días</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="fifteendays"
                                id="fifteendays"
                                value={15}
                                onChange={handlerDate}
                                checked={dateState === "15"}

                            />
                            <label htmlFor="fifteendays">Quince Días</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="thirtydays"
                                id="thirtydays"
                                value={30}
                                onChange={handlerDate}
                                checked={dateState === "30"}

                            />
                            <label htmlFor="thirtydays">Trenita Días</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="sixtydays"
                                id="sixtydays"
                                value={60}
                                onChange={handlerDate}
                                checked={dateState === "60"}
                            />
                            <label htmlFor="sixtydays">Sesenta Días</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="radio"
                                name="ninetydays"
                                id="ninetydays"
                                value={90}
                                onChange={handlerDate}
                                checked={dateState === "90"}
                            />
                            <label htmlFor="ninetydays">Noventa Días</label>
                        </div>
                    </div>
                </div>
            }
            <div className="flex flex-col gap-4 text-lg w-full">
                <p className="text-lg font-normal">Descripción de la factura: </p>
                <p className="w-full bg-slate-200 p-4 rounded-md text-black">
                    {project?.descriptionInvoice}
                </p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <p className="text-normal font-bold">Confirmar Pedido de Facturación</p>
                <ComponentButton
                    buttonStyle={
                        !dateInvoiceOrder?.date && dateInvoiceOrder?.status ?
                            "bg-gray" :
                            ""
                    }
                    conditionDisabled={!dateInvoiceOrder?.date && dateInvoiceOrder?.status}
                    buttonEvent={() => confirmInvoice(project?.status)}
                    buttonText="Confirmar Factura"
                />
            </div>
        </div>
    )
}

