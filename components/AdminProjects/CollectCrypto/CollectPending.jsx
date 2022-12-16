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
import { useHost } from "../../../context/host"

import { sendEmail } from "../../../functions/sendMail"


export const CollectPending = ({ project, keyProject }) => {
    const db = getDatabase()
    const { user } = useAuth()
    const { host } = useHost()
    const [descriptionInvoice, setDescriptionInvoice] = useState()

    const confirmCallCollect = () => {
        if (descriptionInvoice) {
            const call_Collect = {
                status: "AWAITING_PAYMENT",
                descriptionInvoice: descriptionInvoice,

            }
            const { textEmail, ...resObj } = call_Collect
            const emailClient = Object.values(project.client).map(client => { return { name: client.clientName, email: client.email } })[0]
            update(ref(db, `projects/${keyProject}`), resObj)
                .then(res => {
                    // host/pay/(nombregrupo)/(nombreproyecto)
                    sendEmail({
                        from: {
                            name: user.name,
                            email: user.email
                        },
                        to: emailClient,
                        subject: `Checkout ${project.nameProject}`,
                        redirect: `${host}/pay/${project.team}/${project.nameProject}`,
                        text: [
                            `Please checkout the project ${project.nameProject}.`
                        ],
                    })
                })
        }
    }
    console.log(project)

    return (
        <div className="w-full mt-8">
            <h2 className="text-xl font-semibold">Request Invoice</h2>
            <div className="flex text-2xl font-bold justify-between w-full gap-4">
                <p>Total amount ◎: </p>
                <p>{project?.totalBruto?.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
            </div>
            {/* <InputSelect
                select
                name="percentage"
                optionDisabled="Porcentaje"
                onChange={handlerPercentage}
            >
                <option value={3} disabled={!project?.percentage || project?.percentage === 3 ? false : true}>Tercio</option>
                <option value={2} disabled={!project?.percentage || project?.percentage === 2 ? false : true}>Mitad</option>
                <option value={1} disabled={!project?.percentage || project?.percentage === 1 ? false : true}>Total</option>
            </InputSelect> */}
            <h3 className="font-normal self-start p-2">Project description:</h3>
            <textarea
                onChange={(e) => setDescriptionInvoice(e.target.value)}
                className="h-40 w-full text-black font-semibold shadow border rounded-xl p-4"
            />
            <div className="flex flex-col items-center gap-2">
                <p className="text-base font-normal">Send invoice to client´s email</p>
                <ComponentButton
                    buttonEvent={() => confirmCallCollect()}
                    buttonStyle={
                        !descriptionInvoice ?
                            "bg-gray-500"
                            :
                            ""
                    }
                    conditionDisabled={!descriptionInvoice}
                    buttonText="Confirm"
                />
            </div>
        </div>
    )
}