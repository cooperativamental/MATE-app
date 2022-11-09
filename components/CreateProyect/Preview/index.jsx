import { useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "../../../context/auth";
import { sendEmail } from "../../../functions/sendMail";

import ComponentButton from "../../Elements/ComponentButton";

import {
    getDatabase, serverTimestamp,
    ref, set, push, get
} from "firebase/database";
import { useHost } from "../../../context/host";

const PreviewProject = ({ project, setProject, setConfirmation }) => {
    const db = getDatabase();

    const { host } = useHost()
    const router = useRouter()

    const { user } = useAuth()
    const [retrySendProposal, setRetrySendProporsal] = useState({
        status: false,
    })

    const sendProposal = (keyProject) => {
        return new Promise((resolve, reject) => {
            const proposalPartner = Object.entries(project.partners).map(([key, valuePartner]) => {
                return new Promise((resolve, reject) => {
                    if (key !== user?.uid) {
                        set(ref(db, `users/${key}/projects/${keyProject}`), {
                            amount: valuePartner?.amount,
                            status: "ANNOUNCEMENT",
                            createdAt: serverTimestamp(),
                        })
                            .then((snapshot) => {
                                const pushNoti = push(ref(db, `notifications/${key}`))
                                let cliName = ""
                                Object.values(project.client).forEach(client => cliName = client.clientName)
                                set(pushNoti,
                                    {
                                        type: "NEW_PROJECT",
                                        projectID: keyProject,
                                        projectHolder: user?.displayName,
                                        client: cliName,
                                        nameProject: project.nameProject,
                                        viewed: false,
                                        open: false,
                                        showCard: false,
                                        statusProject: "ANNOUNCEMENT",
                                        createdAt: serverTimestamp()
                                    }
                                )
                                    .then(res => {
                                        sendEmail(
                                            {
                                                from: {
                                                    name: user.name,
                                                    email: user.email
                                                },
                                                to: {
                                                    name: valuePartner.name,
                                                    email: valuePartner.email
                                                },
                                                subject: "New project invitation",
                                                redirect: `${host}/projects/${keyProject}`,
                                                text: [
                                                    `Member: ${user.name},`,
                                                    `Invites you to join ${project.nameProject} for ${cliName}.`
                                                ],
                                            }
                                        )
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })

                                resolve("Proposal Sent")
                            })
                            .catch((error) => {
                                // The write failed...
                                console.log(error);
                                reject(error)
                            });
                    } else {
                        resolve("Project owner")
                    }

                })
            })
            Promise.all(proposalPartner)
                .then(res => {
                    resolve("All proposals were successfully submitted")
                })
                .catch(err => {
                    reject(`Sorry, there was an error, please try again, ${err}`)
                })
        })
    }

    const confirmProject = async () => {
        const projectRef = ref(db, "projects/");
        const pushProject = push(projectRef);
        set(pushProject, {
            ...project,
            createdAt: serverTimestamp(),
        })
            .then((snapshot) => {
                set(ref(db, "users/" + user.uid + "/projectsOwner/" + pushProject.key), {
                    nameProject: project.nameProject,
                })
                sendProposal(pushProject.key)
                    .then(res => {
                        setProject({
                            ...project,
                            nameProject: "",
                            client: {},
                            start: "",
                            end: "",
                            totalNeto: 0,
                            thirdParties: { amount: 0 },
                            partners: []
                        })

                        setRetrySendProporsal({
                            status: false,
                        })
                        router.push({
                            pathname: "/projects/[id]",
                            query: { holder: true, id: pushProject.key }
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        setRetrySendProporsal({
                            status: true,
                            key: pushProject.key
                        })
                    })
            })
            .catch((error) => {
                // The write failed...
                console.error(error);
            });
    }


    const renderInfo = (info) => {
        if (info) {
            return Object.entries(info).map(([key, value]) => {
                return (
                    <div key={key} className="flex flex-row h-10 w-full justify-between font-medium text-base items-center border-b-2 border-slate-300">
                        <label>{value.name}</label>
                        <p>{value.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
                    </div>
                )
            })
        }
    };

    return (
        <div className="flex flex-col w-8/12 gap-y-8" >
            <div className="flex items-center justify-between w-10/12 h-12">
                <p className="flex items-start text-lg font-medium">{project.nameProject}</p>
                <p className="flex items-start text-lg font-medium">{Object.values(project.client).map(client => { return client.clientName })}</p>
            </div>
            <hr className="flex bg-slate-300 border-[1px] w-full" />
            <div className="flex items-center justify-between w-10/12 font-normal ">
                <p>KickOff: {new Date(project.start).toLocaleDateString('es-ar')}</p>
                <p>Deadline:  {new Date(project.end).toLocaleDateString('es-ar')}</p>
            </div>
            <hr className="flex bg-slate-300 border-[1px] w-full" />
            <div className="flex items-center h-8 w-full justify-between font-medium text-base">
                <label>Total invoice ◎</label>
                <p>{project.totalBruto}</p>
            </div>
            <div className="flex items-center h-8 w-full justify-between font-medium text-base">
                <label>Net Total ◎</label>
                <p>{project.totalNeto}</p>
            </div>
            <hr className="flex bg-slate-300 border-[1px] w-full " />
            <div className="flex items-center h-4 w-full justify-between font-medium text-base">
                <label>Third party expenses</label>
                <p>{project.thirdParties?.amount.toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
            </div>

            <hr className="flex bg-slate-300 border-[1px] w-full " />

            <div className="flex items-center h-10 w-full justify-between font-medium text-2xl">
                <label>Team Budget ◎</label>
                <p>{(project?.totalNeto - project?.thirdParties?.amount).toLocaleString('es-ar', { minimumFractionDigits: 2 })}</p>
            </div>
            <hr className="  flex bg-slate-300 border-[1px] w-full " />

            <div className="flex items-center h-4 w-full justify-between font-light text-sm">
                <label>Reserve percentage %</label>
                {project?.ratio}
            </div>
            <div className="flex items-center h-10 w-full justify-between font-light text-base">
                <label>Reserve ◎</label>
                {`${((project?.ratio * (project?.totalNeto - project?.thirdParties?.amount)) / 100).toLocaleString('es-ar', { minimumFractionDigits: 2 })}`}
            </div>
            {
                renderInfo(project.partners)
            }
            <div className="flex flex-col items-center gap-4 m-4">

                <p className="text-base font-normal">Send proposals to your partners</p>
                <div className="w-8/12">
                    <ComponentButton
                        buttonText="Edit"
                        buttonEvent={() => { setConfirmation({
                            INFO_PROJECT: false,
                            BUDGET: false,
                            ASSEMBLE_TEAM: false
                          })}}
                    />
                </div>
                {
                    retrySendProposal.status ?
                        <ComponentButton
                            buttonEvent={() => sendProposal(retrySendProposal.key)}
                            buttonText="Retry sending to Partners"
                        />
                        :
                        <ComponentButton
                            buttonEvent={confirmProject}
                            buttonText="Gather Team"

                        />

                }
            </div>

        </div>
    )
}

export default PreviewProject