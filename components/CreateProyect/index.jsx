import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"

import InfoProject from "./infoProject"
import Budget from "./Budget"

import {
  getDatabase, serverTimestamp,
  ref, set, push, get
} from "firebase/database";
import { User } from "firebase/auth";

import { useAuth } from "../../context/auth";
import { useHost } from "../../context/host";
import { sendEmail } from "../../functions/sendMail"
import ComponentButton from "../Elements/ComponentButton";
import { getDoc, doc, serverTimestamp as serverTimestampFS } from "firebase/firestore";


const CreateProject = () => {
  const router = useRouter()
  const db = getDatabase();
  const refContainer = useRef()
  const { user, firestore } = useAuth()
  const { host } = useHost()
  const [retrySendProposal, setRetrySendProporsal] = useState({
    status: false,
  })
  const [confirmation, setConfirmation] = useState({
    infoProject: false,
    budget: false
  })
  const [project, setProject] = useState({
    projectHolder: {},
    nameProject: "",
    client: "",
    start: "",
    end: "",
    totalBruto: 0,
    totalNeto: 0,
    thirdParties: {
      amount: 0
    },
    partners: {},
    status: "ANNOUNCEMENT",
    currency: "SOL",
    invoiceDate: false,
    fiatOrCrypto: "CRYPTO",
    organization: router?.query?.organization,
    ratio: 0
  })

  useEffect(() => {
    getDoc(doc(firestore, "users", user?.uid))
      .then(res =>
        setProject(
          {
            ...project,
            projectHolder: {
              [user.uid]: {
                fullName: res.data().fullName,
                email: res.data().email
              }
            }
          }
        )
      )
  }, [db, user])

  const confirmInfoProject = (confirm) => {
    confirm && setConfirmation(confirm)
    refContainer.current.scrollTo(0, 0)
  }


  const sendProposal = (keyProject) => {
    return new Promise((resolve, reject) => {
      const proposalPartner = Object.entries(project.partners).map(([key, valuePartner]) => {
        return new Promise((resolve, reject) => {
          set(ref(db, "users/" + key + "/projects/" + keyProject), {
            amount: valuePartner?.amount,
            status: key !== user?.uid ? "ANNOUNCEMENT" : "CONFIRMED",
            createdAt: serverTimestamp(),
          })
            .then((snapshot) => {
              if (key !== user?.uid) {
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
                          name: user.fullName,
                          email: user.email
                        },
                        to: {
                          name: valuePartner.fullName,
                          email: valuePartner.email
                        },
                        subject: "New project invitation",
                        redirect: `${host}/projects/${keyProject}`,
                        text: [
                          `Member: ${user.fullName},`,
                          `Invites you to join ${project.nameProject} for ${cliName}.`
                        ],
                      }
                    )
                  })
                  .catch(err => {
                    console.log(err)
                  })
              }
              resolve("Proposal Sent")
            })
            .catch((error) => {
              // The write failed...
              console.log(error);
              reject(error)
            });
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
            setConfirmation({
              budget: true,
              infoProject: true
            })
            setRetrySendProporsal({
              status: false,
            })
            router.push({
              pathname: "/adminprojects",
              query: { type: "NEW_PROJECT", key: pushProject.key }
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

  return (
    <div 
      className="flex flex-col items-center gap-4 h-full w-full overflow-y-auto scrollbar"
      ref={refContainer}
    >
      <div className="sticky flex top-0 p-1 bg-slate-900 z-20 w-8/12 justify-center">
        {
          confirmation.infoProject &&
          <ComponentButton
            buttonText="Edit Info Project"
            buttonEvent={() => {
              confirmInfoProject({
                ...confirmation,
                infoProject: false
              })
            }}
          />
        }
        {
          confirmation.budget &&
          <ComponentButton
            buttonText="Edit Budget"
            buttonEvent={() => {
              confirmInfoProject({
                ...confirmation,
                budget: false
              })
            }}
          />
        }
      </div>
      <div className="flex w-6/12 justify-between font-bold text-xl">
        <p>Project Holder:</p>
        <p> {`${Object.values(project.projectHolder).map(val => val.fullName)} `}</p>
      </div>
        <hr className=" h-[3px] flex bg-slate-300 border-[1px] w-8/12 " />
      <InfoProject
        confirmInfoProject={confirmInfoProject}
        confirmation={confirmation}
        organization={project.organization}
        setProject={setProject}
        project={project}
      />
      {
        confirmation.infoProject &&
        <Budget
          confirmInfoProject={confirmInfoProject}
          confirmation={confirmation}
          currency={project?.currency}
          setProject={setProject}
          project={project}
          // taxesClient={Object.values(project.client).map(res => res.taxes)[0]}
        />
      }
      {
        confirmation.budget && confirmation.infoProject &&
        <div className="flex flex-col items-center gap-4 m-4">
          <p className="text-base font-normal">Send proposals to your partners</p>
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
      }

    </div>
  )
}

export default CreateProject
