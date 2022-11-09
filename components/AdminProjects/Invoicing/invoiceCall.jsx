import { useState } from "react"

import {
    getDatabase,
    ref,
    update,
    set,
    push,
    get,
    serverTimestamp,

} from "firebase/database";

import ComponentButton from "../../Elements/ComponentButton"
import InputSelect from "../../Elements/InputSelect"
import { useAuth } from "../../../context/auth";

export const InvoiceCall = ({ project, keyProject }) => {
    const db = getDatabase()
    const { user } = useAuth()
    const [percentage, setPercentage] = useState(undefined)
    const [descriptionInvoice, setDescriptionInvoice] = useState()
    const [errors, setError] = useState({
        date: true,
        percentage: true
    })

    const handlerPercentage = (e) => {
        if (e.target.value !== "0") {
            setPercentage(e.target.value)
            setError({
                ...errors,
                percentage: false
            })
        } else {
            setError({
                ...errors,
                percentage: true
            })
        }
    }

    const confirmInvoice = () => {
        if (descriptionInvoice) {
            try {
                const invoice_pending = {
                    status: "INVOICE_CALL",
                    percentage: percentage && Number(percentage),
                    descriptionInvoice: descriptionInvoice,
                    textEmail: (txt) => {
                        let text = ""
                        if (txt?.percentage === 1) {
                            text = " 100% "
                        } else if (txt?.percentage === 2) {
                            text = " 50% "
                        } else {
                            text = " 1/3 "
                        }
                        return ({
                            text: [
                                `${txt?.projectHolder} request for invoicing ${text}`,
                                `from tthe project "${txt?.nameProject}" to ${txt?.client}`
                            ],
                            subject: "Invoice request",
                        })
                    },
                    percentage: percentage && Number(percentage),
                    descriptionInvoice: descriptionInvoice
                }
                const { textEmail, ...resObj } = invoice_pending
                update(ref(db, `projects/${keyProject}`), resObj)
                    .then(res => {
                        get(ref(db, `users/`)).then(res => {
                            const resValue = res.val()
                            Object.entries(resValue).forEach(([key, valueUser]) => {
                                if (valueUser.priority === "ADMIN") {
                                    const pushNoti = push(ref(db, `notifications/${key}`))
                                    const prjOwn = Object.values(project.projectHolder).forEach(val => val.name)
                                    const cliName = Object.values(project.client).forEach(client => client.clientName)
                                    set(pushNoti,
                                        {
                                            type: invoice_pending.status,
                                            projectID: keyProject,
                                            petitioner: user.displayName,
                                            projectHolder: prjOwn[0],
                                            client: cliName[0],
                                            team: project.team,
                                            nameProject: project.nameProject,
                                            percentage: percentage ? Number(percentage) : project.percentage,
                                            viewed: false,
                                            open: false,
                                            showCard: false,
                                            createdAt: serverTimestamp()
                                        }
                                    )
                                        .then(res => {
                                            sendEmail({
                                                ...invoice_pending.textEmail({
                                                    percentage: percentage ? Number(percentage) : project.percentage,
                                                    nameProject: project.nameProject,
                                                    client: cliName,
                                                    projectHolder: prjOwn
                                                }),
                                                from: {
                                                    name: user.name,
                                                    email: user.email
                                                },
                                                to: {
                                                    name: valueUser.name,
                                                    email: valueUser.email
                                                },
                                                redirect: `${host}`,
                                            })
                                            router.push(router.pathname)
                                        })
                                }
                            })
                        })
                    })
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Enviar pedido de facturación a la Administración</h2>
            <div className="flex text-2xl font-bold justify-between w-full gap-4">
                <p>Total Bruto: </p>
                <p>{project?.totalBruto.toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })}</p>
            </div>
            <InputSelect
                select
                name="percentage"
                optionDisabled="Porcentaje"
                onChange={handlerPercentage}
            >
                <option value={3} disabled={!project?.percentage || project?.percentage === 3 ? false : true}>Tercio</option>
                <option value={2} disabled={!project?.percentage || project?.percentage === 2 ? false : true}>Mitad</option>
                <option value={1} disabled={!project?.percentage || project?.percentage === 1 ? false : true}>Total</option>
            </InputSelect>
            <h3 className="font-normal self-start">Descripción de la factura: </h3>
            <textarea
                onChange={(e) => setDescriptionInvoice(e.target.value)}
                className="h-40 w-full shadow border rounded-xl p-4"
            />
            <div className="flex flex-col items-center gap-2">
                <p className="text-base font-normal">Enviar Pedido de Facturación</p>
                <ComponentButton
                    buttonEvent={confirmInvoice}
                    buttonStyle={
                        errors.percentage || !descriptionInvoice ?
                            "bg-[grey]"
                            :
                            ""
                    }
                    conditionDisabled={errors?.percentage || !descriptionInvoice}
                    buttonText="Enviar"
                />
            </div>
        </div>
    )
}