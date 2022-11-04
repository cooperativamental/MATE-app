import ComponentButton from "../../Elements/ComponentButton"

import {
    getDatabase,
    ref,
    update,
    set,
    push,
    get,
    serverTimestamp,

} from "firebase/database";

export const BillCollected = ({ project, team, keyProject }) => {
    const db = getDatabase()

    const confirmInvoice = () => {

        const invoice_order = {
            status: "BILL_COLLECTED",
            textEmail: (txt) => {
                let text = ""
                if (txt?.percentage === 1) {
                    text = "El 100%"
                } else if (txt?.percentage === 2) {
                    text = "El 50%"
                } else {
                    text = "Un tercio"
                }

                return ({
                    text: [`${text} del proyecto "${txt?.nameProject}"`, `fue cobrado a ${txt?.client}`],
                    subject: `Pagó ${txt?.client}`
                })
            }
        }

        const { textEmail, ...resObj } = invoice_order
        update(ref(db, `projects/${keyProject}`), resObj)
            .then(res => {
                get(ref(db, `users/`)).then(res => {
                    const resValue = res.val()
                    Object.entries(resValue).forEach(([key, valueUser]) => {
                        const pushNoti = push(ref(db, `notifications/${Object.keys(project.projectHolder).map(key => key)[0]}`))
                        set(pushNoti,
                            {
                                type: invoice_order.status,
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
                                    ...invoice_order.textEmail({
                                        percentage: project.percentage,
                                        nameProject: project.nameProject,
                                        client: Object.values(project.client).map(client => client.clientName)[0],
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
                    )
                })
            })

    }

    return (
        <div className="flex flex-col">
            <div className="flex text-xl font-bold justify-between w-full">
                <p>Nombre de Proyecto: </p>
                <p>{project?.nameProject}</p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />

            <div className="flex text-xl font-bold justify-between w-full">
                <p>Cliente: </p>
                <p>{project?.client && Object.values(project.client).map(client => client.clientName)}</p>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full  " />

            <div className="flex flex-col gap-4 items-center">
                <p className="text-base font-semibold">Confirmar que el proyecto ha sido cobrado.</p>
                <ComponentButton
                    buttonText="Anunciar"
                    buttonEvent={() => confirmInvoice(project?.status)}
                />
            </div>
        </div>
    )
}