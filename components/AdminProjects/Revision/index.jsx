import { useState, useEffect } from "react"

import {
  getDatabase,
  ref,
  update,
  push,
  set,
  serverTimestamp,
  onValue
} from "firebase/database";
import { sendEmail } from "../../../functions/sendMail"
import { useAuth } from "../../../context/auth"
import InputSelect from "../../Elements/InputSelect";
import ComponentButton from "../../Elements/ComponentButton";

const RevisionPartners = ({ keyProject, project }) => {
  const db = getDatabase()
  const [revisionPartners, setRevisionPartners] = useState()
  const { user } = useAuth();
  const [errors, setError] = useState()

  useEffect(() => {
    if (keyProject && user) {
      const unsubscribe = onValue(ref(db, `projects/${keyProject}`), res => {
        if (res.hasChildren()) {
          Object.entries(res.val().partners).map(([key, value]) => {
            if (value.status === "REVISION_PARTNER") {
              setRevisionPartners({
                ...revisionPartners,
                [key]: value.revision
              })
            }
          })
        }
      })
      return () => {
        unsubscribe()
      }
    }
  }, [keyProject])

  const handleAmountPartner = (e, userId) => {
    setRevisionPartners({
      ...revisionPartners,
      [userId]: Number(e.target.value)
    })
  }

  const confirmRevision = () => {
    Object.entries(revisionPartners).map(([key, value]) => {
      update(ref(db, `projects/${keyProject}`), {
        status: "ANNOUNCEMENT",
      }).then(res => {
        update(ref(db, `projects/${keyProject}/partners/${key}`), {
          status: "ANNOUNCEMENT",
          revision: null,
          amount: value
        })
          .then((res) => {
            update(ref(db, `users/${key}/projects/${keyProject}`), {
              status: "ANNOUNCEMENT",
              revision: null,
              amount: value
            }).then(res => {
              const pushNoti = push(ref(db, `notifications/${key}`))
              let projOwn = ""
              Object.values(project.projectHolder).forEach(val => projOwn = val.fullName)
              let cliName = ""
              Object.values(project.client).forEach(client => cliName = client.clientName)
              set(pushNoti,
                {
                  type: "REVISION_CONFIRM",
                  projectHolder: projOwn,
                  projectID: keyProject,
                  client: cliName,
                  nameProject: project.nameProject,
                  viewed: false,
                  open: false,
                  showCard: false,
                  createdAt: serverTimestamp()
                }
              )
                .then(res => {
                  sendEmail({
                    from: {
                      name: user.fullName,
                      email: user.email
                    },
                    to: {
                      name: project.partners[key].fullName,
                      email: project.partners[key].email
                    },
                    subject: `El titular ${projOwn} confirma la revisión`,
                    redirect: `${host}/wallet/projects/${value.projectID}`,
                    text: [
                      `${project.partners[key].fullName}`,
                      `Se realizo una nueva propuesta por ${revisionPartners?.[key]}`,
                    ],
                  })
                })
            }
            )
          })
      })
        .catch((err) => console.error(err));

    })
  };

  return (
    <div className="flex flex-col items-center w-11/12 gap-8">
      <div className="flex w-8/12 justify-between text-xl font-bold">
        <p>{project?.nameProject}</p>
        <p >{project?.client && Object.values(project?.client).map(res => res.clientName)}</p>
      </div>
      <div className="flex w-8/12 justify-between text-xl font-semibold">
        <p >Total Neto: </p>
        <p>{project?.currency && project?.totalNeto.toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })}</p>
      </div>
      <div className="flex w-8/12 justify-between text-xl font-semibold">
        <p>Pactado con Terceros:
        </p>
        <p>
          {
            project?.currency && project?.thirdParties?.amount
              .toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })
          }
        </p>
      </div>
      <h4 className="text-lg font-bold">Socios y Asociados</h4>
      <div className="flex flex-wrap gap-8">
        {
          project && project.partners &&
          Object.entries(project?.partners)?.map(([key, value]) => {
            if (value.status === "REVISION_PARTNER") {
              return (
                <div key={key} className="flex flex-col gap-4 items-center w-max text-base rounded-md bg-slate-200 p-4 font-normal">
                  <div className="flex flex-col w-full ">
                    <p className="font-bold text-2xl">{value.fullName}</p>
                    <div className="flex w-full gap-10 text-md font-semibold">
                      <p>Monto pactado:</p>
                      <p>{value.amount.toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex w-full gap-10 text-md font-semibold">
                      <p>Monto solicitado:</p>
                      <p>{value.revision.toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex w-full gap-10 text-md font-semibold">
                      <p>Estado del socio:</p>
                      <p>Revisión</p>
                    </div>
                  </div>
                  <label className="text-xl font-semibold" htmlFor="totalNeto">Solicitud de Revisión: </label>
                  <InputSelect
                    type="number"
                    name="totalNeto"
                    inputStyle="h-10"
                    value={(revisionPartners?.[key]).toString()}
                    onChange={(e) => handleAmountPartner(e, key)}
                  />
                </div>

              )
            }
          })
        }
      </div>
      <ComponentButton
        buttonText="Enviar Revisión"
        buttonEvent={confirmRevision}
      />
    </div>
  )
}

export default RevisionPartners