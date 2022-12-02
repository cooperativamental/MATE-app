import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router";

import {
  getDatabase,
  ref,
  update,
  set,
  push,
  get,
  serverTimestamp,
  onValue,
  orderByChild

} from "firebase/database";

import InputSelect from "../../Elements/InputSelect"
import ComponentButton from "../../Elements/ComponentButton"

import { InvoiceCall } from "./invoiceCall";
import { InvoicePending } from "./invoicePending";

import { useAuth } from "../../../context/auth"
import { useHost } from "../../../context/host"
import { sendEmail } from "../../../functions/sendMail"
import { query } from "firebase/firestore";


const InvoiceRequest = ({ keyProject, project, team }) => {
  const db = getDatabase()
  const { user } = useAuth()
  const { host } = useHost()
  const router = useRouter()
  const [dateInvoiceOrder, setDateInvoiceOrder] = useState({
    date: "",
    status: false
  })
  const [percentage, setPercentage] = useState(undefined)
  const [radioState, setRadioState] = useState()
  const [teamValues, setTeamValues] = useState()
  const [descriptionInvoice, setDescriptionInvoice] = useState()
  const [errors, setError] = useState({
    date: true,
    percentage: true
  })

  useEffect(() => {
    if (keyProject && user) {
      get(ref(db, `projects/${keyProject}`))
        .then(res => {
          get(query(ref(db, `teams/${team}`)))
            .then(resTeam => setTeamValues(resTeam.val()))
        })
    }
  }, [keyProject, team])

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

  // const handlerPercentage = (e) => {
  //   if (e.target.value !== "0") {
  //     setPercentage(e.target.value)
  //     setError({
  //       ...errors,
  //       percentage: false
  //     })
  //   } else {
  //     setError({
  //       ...errors,
  //       percentage: true
  //     })
  //   }
  // }

  // const handlerDate = (e) => {
  //   const newDate = new Date()
  //   newDate.setMonth(newDate.getMonth() + 1);
  //   newDate.setDate(newDate.getDate() + Number(e.target.value));

  //   const date = [
  //     newDate.getFullYear(),
  //     newDate.getMonth() < 10 ? "0" + newDate.getMonth() : newDate.getMonth(),
  //     newDate.getDate() < 10 ? "0" + newDate.getDate() : newDate.getDate(),
  //   ].join("-");
  //   setRadioState(e.target.value)
  //   setDateInvoiceOrder({
  //     ...dateInvoiceOrder,
  //     date: date,
  //   })
  //   setError({
  //     ...errors,
  //     date: false
  //   })
  // }

  const confirmInvoice = (status) => {
    const fnAmountToInvoice = () => {
      if (!project?.amountToInvoice) {
        return (project?.totalBruto - (project?.totalBruto / project.percentage))
      } else if (project?.amountToInvoice > project?.totalBruto / project.percentage) {
        return (Math.round(project?.amountToInvoice - (project?.totalBruto / 3)))
      } else {
        return (project?.amountToInvoice - (project?.totalBruto / project.percentage))
      }
    }



    const typeUpdate = {
      // invoice_pending: {
      //   status: "INVOICE_CALL",
      //   textEmail: (txt) => {
      //     let text = ""
      //     if (txt?.percentage === 1) {
      //       text = " del 100% "
      //     } else if (txt?.percentage === 2) {
      //       text = " del 50% "
      //     } else {
      //       text = " de un tercio "
      //     }
      //     return ({
      //       text: [
      //         `${txt?.projectHolder} solicita la facturación ${text}`,
      //         `del proyecto "${txt?.nameProject}" a ${txt?.client}`
      //       ],
      //       subject: "Solicitud de facturación",
      //     })
      //   },
      //   percentage: percentage && Number(percentage),
      //   descriptionInvoice: descriptionInvoice
      // },
      invoice_call: {
        status: "INVOICE_ORDER",
        amountToInvoice: fnAmountToInvoice(),
        invoiceDate: dateInvoiceOrder.date,
        textEmail: (txt) => {
          return ({
            text: [`Fue facturado el  proyecto ${txt?.nameProject}`],
            subject: `El proyecto ${txt?.nameProject} facturado`
          })
        }
      },
      invoice_order: {
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
    }


    if (
      (status === "INVOICE_PENDING" && typeUpdate[status.toLowerCase()].percentage && typeUpdate[status.toLowerCase()].descriptionInvoice) ||
      status === "INVOICE_CALL" && typeUpdate[status.toLowerCase()].amountToInvoice > 0 ||
      ((status === "INVOICE_CALL" && typeUpdate[status.toLowerCase()].amountToInvoice === 0) && typeUpdate[status.toLowerCase()].invoiceDate) ||
      status === "INVOICE_ORDER"
    ) {
      const { invoiceDate, textEmail, ...resObj } = typeUpdate[status.toLowerCase()]
      update(ref(db, `projects/${keyProject}`), !invoiceDate ? resObj : { ...resObj, invoiceDate })
        .then(res => {
          get(ref(db, `users/`)).then(res => {
            const resValue = res.val()
            Object.entries(resValue).forEach(([key, valueUser]) => {
              if (
                typeUpdate[status.toLowerCase()].status === "INVOICE_CALL"
                &&
                valueUser.priority === "ADMIN"
              ) {
                const pushNoti = push(ref(db, `notifications/${key}`))
                let prjOwn = ""
                Object.values(project.projectHolder).forEach(val => prjOwn = val.name)
                let cliName = ""
                Object.values(project.client).forEach(client => cliName = client.clientName)
                set(pushNoti,
                  {
                    type: typeUpdate[status.toLowerCase()].status,
                    projectID: keyProject,
                    petitioner: !(typeUpdate[status.toLowerCase()].status === "COBRADO") ? user.displayName : null,
                    projectHolder: prjOwn,
                    client: cliName,
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
                      ...typeUpdate[status.toLowerCase()].textEmail({
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
                    // router.push({
                    //   pathname: router.pathname,

                    //   query: {
                    //     group:
                    //   }
                    // })
                  })
              } else if (
                (
                  typeUpdate[status.toLowerCase()].status === "INVOICE_ORDER"
                  ||
                  typeUpdate[status.toLowerCase()].status === "COBRADO"
                )
                &&
                Object.keys(project.projectHolder).map(key => key)[0] === key
              ) {
                const pushNoti = push(ref(db, `notifications/${Object.keys(project.projectHolder).map(key => key)[0]}`))
                set(pushNoti,
                  {
                    type: typeUpdate[status.toLowerCase()].status,
                    projectID: keyProject,
                    client: Object.values(project.client).map(client => client.clientName),
                    nameProject: project.nameProject,
                    percentage: percentage ? Number(percentage) : project.percentage,
                    viewed: false,
                    team: team,
                    open: false,
                    showCard: false,
                    createdAt: serverTimestamp()
                  }
                )
                  .then(res => {
                    sendEmail({
                      ...typeUpdate[status.toLowerCase()].textEmail({
                        percentage: percentage ? Number(percentage) : project.percentage,
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
            })
          })
        })
    }
  };


  const render = (status) => {
    const objRender = {
      invoice_pending: <InvoicePending keyProject={keyProject} project={project} />,
      invoice_call: <InvoiceCall project={project} confirmInvoice={confirmInvoice} />
    }

    const proxy = new Proxy(objRender, {
      get: (target, prop) => {
        if (prop in target) {
          return target[prop]
        } else {
          return (
            <>
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
            </>
          )
        }
      }
    })

    return proxy[status]
  }

  return (
    <div className="flex flex-col items-center h-min w-11/12 px-4 gap-4">
      {
        render(project?.status?.toLowerCase())
      }
    </div>
  )
}

export default InvoiceRequest