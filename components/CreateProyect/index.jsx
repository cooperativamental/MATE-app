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
import AssembleTeam from "./AssembleTeam";
import PreviewProject from "./Preview";


const CreateProject = () => {
  const router = useRouter()
  const db = getDatabase();
  const refContainer = useRef()
  const { user, firestore } = useAuth()

  const [errors, setErrors] = useState({})
  const [available, setAvailable] = useState(0)
  const [reserve, setReserve] = useState(0)


  const [confirmation, setConfirmation] = useState({
    INFO_PROJECT: false,
    BUDGET: false,
    ASSEMBLE_TEAM: false
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
    team: router?.query?.team,
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
                name: res.data().name,
                email: res.data().email
              }
            }
          }
        )
      )
  }, [db, user])

  const confirmInfoProject = (confirm, status, next) => {
    setConfirmation({
      ...confirmation,
      [confirm]: status
    })
  }

  useEffect(() => {
    let amountTotalPartners = 0
    project?.partners && Object.values(project?.partners).forEach(partner => {
      amountTotalPartners += (partner?.amount || 0)
    })

    setAvailable(((project?.totalNeto - project?.thirdParties?.amount) * (1 - (project.ratio / 100))) - Number((amountTotalPartners).toFixed(3)))
    setReserve((project?.ratio * (project?.totalNeto - project?.thirdParties?.amount)) / 100)

    setErrors({
      thirdParties: (project?.totalNeto - project?.thirdParties?.amount) < 0,
      available: ((project?.totalNeto - project?.thirdParties?.amount) * (1 - (project.ratio / 100))) - Number((amountTotalPartners).toFixed(3)) < 0,
      totalPartners: ((project?.totalNeto - project?.thirdParties?.amount) * (1 - (project.ratio / 100))) - Number((amountTotalPartners).toFixed(3)) != 0,
      partners: !Object.keys(project?.partners).length || !!Object.entries(project?.partners).find(([keyPartner, partner]) => !partner.amount || (keyPartner === user.uid && !partner.wallet))
    })
  }, [project.totalNeto, project.thirdParties, project.partners, project.ratio])

  return (
    <div
      className="flex flex-col items-center gap-4 h-full w-full overflow-y-auto scrollbar"
      ref={refContainer}
    >

      <div className="flex w-6/12 justify-between font-bold text-xl">
        <p>Project Holder:</p>
        <p> {`${Object.values(project.projectHolder).map(val => val.name)} `}</p>
      </div>
      <hr className=" h-[3px] flex bg-slate-300 border-[1px] w-8/12 " />
      {
        (confirmation.INFO_PROJECT && confirmation.BUDGET && !confirmation.ASSEMBLE_TEAM) &&
        <div className="sticky w-8/12 top-0 mt-1 z-20 bg-slate-900  border-[1px] border-x-slate-300 flex flex-col items-center font-bold gap-4 p-4 rounded-lg text-xl">
          <div className="flex flex-wrap p-1 bg-slate-900 z-20 gap-4 justify-center">
            <>
              {
                confirmation.INFO_PROJECT &&
                <ComponentButton
                  buttonStyle="w-min h-min sm:h-16"
                  buttonText="Edit Info Project"
                  buttonEvent={() => setConfirmation({
                    ...confirmation,
                    INFO_PROJECT: false,
                    BUDGET: false,
                  })}
                />
              }
              {
                confirmation.BUDGET &&
                <ComponentButton
                  buttonStyle="w-min h-min sm:h-16"
                  buttonText="Edit Budget"
                  buttonEvent={() => setConfirmation({
                    ...confirmation,
                    BUDGET: false,
                  })}
                />
              }
              {
                confirmation.ASSEMBLE_TEAM &&
                <ComponentButton
                  buttonStyle="w-min"
                  buttonText="Edit Team"
                  buttonEvent={() => setConfirmation({
                    ...confirmation,
                    ASSEMBLE_TEAM: false
                  })}
                />
              }
            </>
          </div>

          {
            !(confirmation.INFO_PROJECT && confirmation.BUDGET && confirmation.ASSEMBLE_TEAM) &&
            <div className=" bg-slate-900 w-full  border-[1px] border-x-slate-300 flex flex-col font-bold gap-4 p-4 rounded-lg text-xl">
              <div className={`flex justify-between ${errors?.available ? " text-red-600" : ""}`}>
                <h3>
                  Available Budget ◎:
                </h3>
                <h3>
                  {`${available.toLocaleString('es-ar', { minimumFractionDigits: 2 })}`}
                </h3>
              </div>
              <div className={`flex justify-between ${errors?.available ? " text-red-600" : ""}`}>
                <h3>
                  Reserve ◎:
                </h3>
                <h3>
                  {reserve.toLocaleString('es-ar', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              {
                errors?.available &&
                <p className=" text-sm font-medium">You cannot exceed the budget available for your team.</p>
              }
            </div>
          }
        </div>
      }


      {
        !confirmation.INFO_PROJECT &&
        <InfoProject
          confirmInfoProject={confirmInfoProject}
          confirmation={confirmation}
          team={project.team}
          setProject={setProject}
          project={project}
        />
      }
      {
        (confirmation.INFO_PROJECT && !confirmation.BUDGET) &&
        <Budget
          available={available}
          confirmInfoProject={confirmInfoProject}
          currency={project?.currency}
          confirmation={confirmation}
          setProject={setProject}
          project={project}
          errors={errors}
        />
      }
      {
        (confirmation.INFO_PROJECT && confirmation.BUDGET && !confirmation.ASSEMBLE_TEAM) &&
        <AssembleTeam
          available={available}
          errors={errors}
          confirmInfoProject={confirmInfoProject}
          confirmation={confirmation}
          currency={project?.currency}
          setProject={setProject}
          project={project}
        />
      }
      {
        confirmation.INFO_PROJECT && confirmation.BUDGET && confirmation.ASSEMBLE_TEAM &&
        <PreviewProject setConfirmation={setConfirmation} project={project} setProject={setProject} />
      }
    </div>
  )
}

export default CreateProject
