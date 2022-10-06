import { useEffect, useState, useRef } from "react"
import { useRouter } from 'next/router'
import { Head } from "next/head"

import { motion } from "framer-motion"

import { useNotification } from '../../../../context/notification'
import { useAuth } from "../../../../context/auth"
import { getDatabase, ref, update } from "@firebase/database"
import { CardsNotification } from "./CardsNotification";
import { CardListNotification } from "./CardListNotification"
import Image from 'next/image'
import Charged from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Decision from "/public/Decision.svg"
import RequestMoney from "/public/RequestMoney.svg"
import Approve from "/public/Approve.png"
import SalaryMale from "/public/Salarymale.png"
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import GroupsIcon from '@mui/icons-material/Groups';
import AcceptProject from "/public/AcceptProject.svg"
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PaidIcon from '@mui/icons-material/Paid';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';


const Notification = () => {
  const db = getDatabase()
  const { notification, lastNotification } = useNotification()
  const [countNotification, setCountNotification] = useState()
  const [notiNotViewed, setNotiNotViewed] = useState()
  const { user } = useAuth()
  const [open, setOpen] = useState()
  const refContainer = useRef()

  const router = useRouter()

  useEffect(() => {
    let count = 0
    Object.values(notification).forEach(noti => noti.viewed === false && count++)
    setCountNotification(count)
    if (count > 0) {
      setNotiNotViewed(count > 0)
    }
  }, [notification])

  const handleNotification = () => {
    if (notiNotViewed) {
      Object.entries(notification).forEach(([key, noti]) => {
        if (!noti.viewed) {
          update(ref(db, `notifications/${user?.uid}/${key}`), { viewed: true })
            .then(res => {
              setOpen(!open)
            })
        }
      })
      setNotiNotViewed(false)
    } else {
      setOpen(!open)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && !refContainer.current.contains(event.target)) {
        setOpen(false)
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refContainer]);
  const sidebar = {
    openContainer: {
      width: "17rem",
      height: "75vh",
      display: "flex",
      backgroundColor: ["#7e22ce", "#000"],
      transition: {
        duration: 1
      },
    },
    closedContainer: {
      width: "3rem",
      height: "3rem",
      transition: {
        duration: 1,
        borderRadius: {
          duration: 1
        }
      },
    },
    open: (width) => {
      return ({
        display: "flex",
        opacity: 1,
        transition: {
          duration: 1
        }
      })
    },
    closed: () => {
      return ({
        opacity: 0,
        transition: {
          duration: 1,
          opacity: {
            duration: 0.5
          }
        },
        transitionEnd: {
          display: "none",
        },
      })
    },
    openIcon: {
      rotate: ["0deg", "-6deg", "6deg", "-6deg", "6deg", "0deg"],
      color: "#7e22ce",
      transition: {
        duration: 1
      }
    },
    closeIcon: {
      rotate: ["0deg", "-6deg", "6deg", "-6deg", "6deg", "0deg"],
      color: "rgb(255,255,255)",
      // left: ".25rem",
      transition: {
        duration: 1
      }
    },
    newNoti: {
      rotate: ["0deg", "-6deg", "6deg", "-6deg", "6deg", "0deg"],
      transition: {
        duration: 1
      }
    }
  };

  const renderNotification = (value, key) => {
    const objRenderNotification = {
      new_project:
        <CardListNotification
          href={{
            pathname: "/projects/[id]",
            query: {
              id: value.projectID
            }
          }}
          as="/projects"
          Icon={() => <GroupsIcon color="disabled" />}
          title={value.projectHolder}
          text={`is sending a proposal to join "${value.nameProject}" for ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      revision_partner:
        <CardListNotification
          href={{
            pathname: "/adminprojects",
            query: {
              prj: value.projectID
            }
          }}
          as="/adminprojects"
          Icon={Decision}
          title={`The partner ${value.petitioner}`}
          text={`ask for a review on "${value.nameProject}" budget for ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}

        />,
      revision_confirm:
        <CardListNotification
          href={{
            pathname: "/projects/[id]",
            query: {
              id: value.projectID
            }
          }}
          as="/projects/"
          Icon={() => <Image height={32} width={32} src={Approve} alt="Revision confirmada" />}
          title={`${value.projectHolder}`}
          text={`Makes the review on "${value.nameProject}" budget for ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      confirm_partner:
        <CardListNotification
          href={{
            pathname: "/adminprojects",
            lquery: {
              prj: value.projectID
            }
          }}
          as="/adminprojects"
          Icon={AcceptProject}
          title={value.namePartner}
          text={`is onboard to team "${value.nameProject}" for ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      invoice_call:
        <CardListNotification
          href={{
            pathname: "/admin/project",
            query: {
              prj: value.projectID
            }
          }}
          as="/admin/project"
          Icon={NoteAddIcon}
          title={value.projectHolder}
          text={`Requiers invoicing
          ${value?.percentage === 1 ?
              " 100% " :
              value?.percentage === 2 ?
                " 50% " :
                " 1/3 "
            }
          of "${value.nameProject}" for ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}

        />,
      invoice_order:
        <CardListNotification
          href={{
            pathname: "/adminprojects",
            query: {
              prj: value.projectID
            }
          }}
          as="/adminprojects"
          Icon={() => <RequestPageIcon color="disabled" />}
          title={value.nameProject}
          text={`Invoiced to ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      bill_collected:
        <CardListNotification
          href={{
            pathname: "/adminprojects",
            query: {
              prj: value.projectID
            }
          }}
          as="/adminprojects"
          Icon={Charged}
          title={`${value.client} paid`}
          text={`${value?.percentage === 1 ?
            " 100% " :
            value?.percentage === 2 ?
              " 50% " :
              " 1/3 "
            }
        project "${value.nameProject}" was paid by ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      liquidated:
        <CardListNotification
          href={
            value.projectID ?
              {
                pathname: "/projects/[id]",

                query: {
                  id: value.projectID
                }
              }
              :
              "/wallet"
          }
          as={value.projectID ? "/projects/" : "/wallet"}
          Icon={() => <Image height={32} width={32} alt="Liquidado" src={SalaryMale} />}
          title={`New Income`}
          text={`Se acreditó tu liquidación ${value?.currency && value?.salarysettlement?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} del proyecto ${value.nameProject} de ${value.client}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      withdrawal:
        <CardListNotification
          href={{
            pathname: `/admin/transferences/[id]`,
            query: {
              id: value.withdrawID,
              u: value.userID
            }
          }}
          as="/admin/transferences"
          Icon={CurrencyExchangeIcon}
          title={value.petitioner}
          text={`Solicita el retiro de ${value?.currency && value?.withdraw?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      currency_conversion:
        <CardListNotification
          href={{
            pathname: `/admin/currencyconversion/[id]`,
            query: {
              id: value.currencyconversionID,
              u: value.userID
            }
          }}
          as="/admin/currencyconversion/"
          Icon={PaidIcon}
          title={value.petitioner}
          text={`Solicita el cambio de ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })}`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      transference_confirm:
        <CardListNotification
          href={{
            pathname: `/wallet`,
            query: {
              type: "WITHDRAWALS"
            }
          }}
          as="/wallet/movements"
          Icon={() => <PriceCheckIcon color="disabled" />}
          title={"Transferencia Confirmada."}
          text={`Retiro de ${value?.currency && value?.withdrawal?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} procesado.`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      invoice_discount:
        <CardListNotification
          href={{
            pathname: `/wallet/movements`,
            query: {
              type: "INVOICE_DISCOUNT"
            }
          }}
          as="/wallet/movements"
          Icon={RequestMoney}
          title={"Factura de terceros."}
          text={`Descuento de factura por ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} de ${value.name}.`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      currency_conversion_confirm:
        <CardListNotification
          href={{
            pathname: `/wallet/movements`,
            query: {
              type: "INVOICE_DISCOUNT"
            }
          }}
          as="/wallet/movements"
          Icon={RequestMoney}
          title={"Factura de terceros."}
          text={`Descuento de factura por ${value?.currency && value?.amount?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} de ${value.name}.`}
          keyNoti={key}
          open={value.open}
          key={key}
        />,
      currency_conversion_reject:
        <CardListNotification
          href={`/wallet`}
          as="/wallet"
          Icon={MonetizationOnIcon}
          title={"Conversion de moneda rechazada."}
          text={`Cambio de ${value?.currency && value?.withdrawal?.toLocaleString('es-ar', { style: 'currency', currency: value.currency, minimumFractionDigits: 2 })} fue rechazado.`}
          keyNoti={key}
          open={value.open}
          key={key}
        />
    }

    return (objRenderNotification[value.type.toLowerCase()])

  }

  return (
    <>
      {/* <Head>
        <link rel="icon" href="favicon.svg" />
      </Head> */}
      {
        router.asPath !== "/" &&
        <CardsNotification />
      }
      <motion.div
        variants={sidebar}
        initial={{ display: "flex", height: "3rem", width: "3rem " }}
        animate={open ? "openContainer" : "closedContainer"}
        ref={refContainer}
        className="fixed z-30 rounded-[0_0_0_1rem] right-0 top-0 shadow-sm shadow-[#000000] bg-[#7e22ce]"
      >
        <motion.div
          variants={sidebar}
          initial={{ display: "flex", left: ".25rem", top: ".25rem", rotate: 0 }}
          animate={[open === true && "openIcon", open === false && "closeIcon", !!lastNotification && "newNoti"]}
          className="origin-center text-white rotate-0 absolute h-max w-max max-w-max z-10 "
          onClick={() => {

            handleNotification()
          }}
        >
          <NotificationsNoneIcon alt="menu open" sx={{ fontSize: "2.5rem" }} />
          {
            countNotification ?
              <div className="absolute right-0 top-0 bg-red-600 rounded-[50%] w-5 h-5 flex items-center justify-center font-bold">
                {
                  countNotification
                }
              </div>
              :
              null
          }
        </motion.div>
        <motion.div
          variants={sidebar}
          initial={{ display: "none", opacity: 0 }}
          animate={open ? "open" : "closed"}
          className="flex flex-col w-full items-center h-full left-0 overflow-hidden rounded-br-2xl mr-[1px] mb-[1px] pt-10"
        >
          {
            Object.entries(notification).length ?
              <ul className="flex h-full w-full pl-4 flex-col items-start py-5 overflow-y-auto overscroll-none gap-4 scrollbar">
                {
                  notification &&
                  Object.entries(notification)?.map(([key, value]) =>
                    renderNotification(value, key)
                  ).reverse()
                }
              </ul>
              :
              <p className="text-base font-bold">No Notifications.</p>
          }
        </motion.div>
      </motion.div>
    </>
  )
}

export default Notification