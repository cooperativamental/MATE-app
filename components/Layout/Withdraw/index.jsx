import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router"
import {
  getDatabase,
  ref,
  set,
  push,
  serverTimestamp,
  update,
  get,
  remove,
} from "firebase/database";
import { getDocs, getDoc, doc, collection, where, query } from "firebase/firestore"
import { getStorage, uploadBytesResumable, ref as sRef } from "firebase/storage";
import { useAuth } from "../../../context/auth";
import { motion } from "framer-motion"
import { sendEmail } from "/functions/sendMail"
import { useHost } from "../../../context/host";
import { useBalance } from "../../../context/contextBalance";
import InputSelect from "../../Elements/InputSelect"

import FileInvoice from "./FileInvoice";

import SearchIcon from '@mui/icons-material/Search';
import ComponentButton from "../../Elements/ComponentButton";

const Withdraw = ({ open, setOpen }) => {
  const db = getDatabase();
  const { user, firestore } = useAuth();
  const { host } = useHost()
  const router = useRouter()
  const { balance, scheduledIngress, openers, handleOpeners } = useBalance()
  const storage = getStorage()
  const refContainer = useRef()
  const [withdrawal, setWithdraw] = useState({
    amount: 0,
    currency: ""
  });
  const [modal, showModal] = useState(false);
  const [fileInvoice, setFileInvoice] = useState([]);
  const [success, setSuccess] = useState(false)
  const [progressImg, setProgressImg] = useState({
    status: false,
    value: 0,
  })
  const [errors, setErrors] = useState({
    invoice: true,
    withdrawal: {},
    invoiceSize: {
      status: false,
      files: []
    }
  });


  useEffect(() => {
    if (user?.regFis !== "RESPONSABLEINSCRIPTO" && user?.regFis !== "MONOTRIBUTO") {
      setErrors({
        ...errors,
        invoice: false
      })
    }
  }, [user])

  const confirmWithdraw = () => {
    try {
      const newDate = new Date();
      const date = [
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
      ].join("-");
      const withdrawRef = ref(db, "withdrawals/" + user.uid);
      const pushWithdraw = push(withdrawRef);
      set(pushWithdraw, {
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        date: date,
        status: false,
        createdAt: serverTimestamp(),
      })
        .then(async (snapshot) => {
          if ((user.regFis === "MONOTRIBUTO" || user.regFis === "RESPONSABLE_INSCRIPTO") && withdrawal.currency === "ARS") {
            const resUploadImg = await uploadImages(pushWithdraw.key)
            if (!resUploadImg.error) {
              setSuccess(true)
            } else {
              remove(db, `${withdrawRef}/${pushWithdraw.key}`)
              throw new Error("El archivo no pudo ser cargado")
            }
          } else {
            setSuccess(true)
          }
          getDoc(doc(firestore, "users"))
          .then(res => {
              if(res.exists()){
                const resValue = res.data()
                Object.entries(resValue).forEach(([key, valueUser]) => {
                  if (valueUser.priority === "ADMIN") {
                    const pushNoti = push(ref(db, `notifications/${key}`))
                    set(pushNoti,
                      {
                        type: "WITHDRAWAL",
                        currency: withdrawal.currency,
                        withdraw: withdrawal.amount,
                        petitioner: user.fullName,
                        withdrawID: pushWithdraw.key,
                        userID: user.uid,
                        viewed: false,
                        open: false,
                        showCard: false,
                        createdAt: serverTimestamp()
                      }
                    ).then(res => {
                      sendEmail(
                        {
                          from: {
                            name: user.fullName,
                            email: user.email
                          },
                          to: {
                            name: valueUser.fullName,
                            email: valueUser.email
                          },
                          subject: "Pedido de Retiro",
                          redirect: `${host}/admin/transferences/${pushWithdraw.key}?u=${user.uid}`,
                          text: [
                            `El socio ${user.fullName}`,
                            `Solicito el retiro de ${withdrawal.currency} ${withdrawal.amount}`,
                          ],
                        }
                      )
                    })
                  }
                })
              }
            })
          if (
            (withdrawal.currency === "ARS" && withdrawal.amount > balance.ARS) ||
            (withdrawal.currency === "USD" && withdrawal.amount > balance.USD)
          ) {
            update(ref(db, `balance/${user.uid}`), (
              withdrawal.currency === "ARS" ?
                { balance: balance.ARS - (withdrawal.amount + 0) }
                :
                { balanceUSD: balance.USD - (withdrawal.amount + 0) }
            ))
          } else {
            update(ref(db, `balance/${user.uid}`), (
              withdrawal.currency === "ARS" ?
                { balance: balance.ARS - withdrawal.amount }
                :
                { balanceUSD: balance.USD - withdrawal.amount }
            ))
          }
        })
        .catch((error) => {
          // The write failed...
          console.error(error);
        });

    } catch (error) {
      alert(error)
    }

  }


  const proccessImg = (e) => {
    let err = {}
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).reduce((acc, file) => {

        if ((file.size / 1024) / 1024 < 0.3 && file.type === "application/pdf") {
          acc = [...acc, {
            file: file,
            url: URL.createObjectURL(file)
          }]
        } else {
          err = {
            ...errors,
            invoiceSize: {
              status: true,
              files: errors?.invoiceSize?.length ?
                [
                  ...errors?.invoiceSize,
                  { name: file.name }
                ]
                :
                [
                  { name: file.name }
                ]
            }
          }
        }
        return acc
      }, []);
      if (Object.keys(err).length > 0) {
        setErrors(err)
      } else {
        if (fileArray.length > 0) {
          setFileInvoice(fileArray);
          setErrors({ ...errors, invoice: false });
          Array.from(e.target.files).map((file) => URL.revokeObjectURL(file));
        }
      }
    }
  };

  const renderPhotos = (source) => {
    return source?.map((file) => {
      return <FileInvoice file={file} url={file.url.split('blob:')[1]} key={file.url} />;
    });
  };

  const handlerConfirmWithdraw = () => {
    if (fileInvoice.length === 0 && (user.regFis === "MONOTRIBUTO" || user.regFis === "RESPONSABLE_INSCRIPTO") && withdrawal.currency === "ARS") {
      return setErrors({ ...errors, invoice: true });
    }
    else if (withdrawal.amount < 1) {
      setErrors({
        ...errors,
        withdrawal: {
          ...errors.withdrawal,
          amount: true
        }
      });
    } else if (!withdrawal.currency) {
      setErrors({
        ...errors,
        withdrawal: {
          ...errors.withdrawal,
          currency: true
        }
      });
    }
    else {
      showModal(true);
    }
  };

  const uploadImages = (keyWithdraw) => {
    return new Promise((res, rej) => {
      try {
        const newDate = new Date();
        const date = [
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
        ].join("-");
        fileInvoice.map(file => {
          const storageRef = sRef(storage, `invoicePartners/${user.uid}/${keyWithdraw}/${file.file.name.split(".")[0]}${newDate.getTime()}.${file.file.name.split(".")[1]}`)
          const uploadImg = uploadBytesResumable(storageRef, file.file, { contentType: "application/pdf" })
          uploadImg.on("state_changed",
            snapshot => {
              const prog = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              )
              setProgressImg({
                status: true,
                value: prog
              })
            },
            error => {
              throw new Error("Tu factura no pudo ser cargada, por favor comunicate con administración.");
            },
            complete => {
              res({ status: "succesfull" })
            }
          )
        })
      } catch (error) {

        rej({ error: error })
      }
    })
  }

  const handlerWithdrawal = (e) => {
    setWithdraw({
      ...withdrawal,
      [e.target.id]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
    })
    if (e.target.id === "amount") {


      if (withdrawal.currency) {
        setErrors({
          ...errors,
          withdrawal: {
            ...errors.withdrawal,
            amount:
              withdrawal.currency === "USD" ?
                Number(e.target.value) > balance.USD + scheduledIngress.total.USD
                :
                Number(e.target.value) > balance.ARS + scheduledIngress.total.ARS
            ,
          }
        })
      } else {
        setErrors({
          ...errors,
          withdrawal: {
            ...errors.withdrawal,
            amount: !(e.target.value > 0)
          }
        })
      }
    } else if (e.target.id === "currency") {
      if (withdrawal.amount) {
        setErrors({
          ...errors,
          withdrawal: {
            amount:
              e.target.value === "USD" ?
                withdrawal.amount > balance.USD + scheduledIngress.total.USD
                :
                withdrawal.amount > balance.ARS + scheduledIngress.total.ARS
            ,
            currency: !e.target.value
          }
        })
      } else {
        setErrors({
          ...errors,
          withdrawal: {
            ...errors.withdrawal,
            currency: !e.target.value
          }
        })
      }
    }
  }

  const withdrawVariants = {
    openContainer: {
      padding: "1rem 0 1rem 0",
      height: "30rem",
      display: "flex",
      transition: {
        padding: {
          duration: 0.5
        },
        duration: 1
      },
    },
    closedContainer: {
      padding: 0,
      height: "0rem",
      transition: {
        ease: "easeInOut",
        padding: {
          delay: 0.5
        },
        duration: 1
      },
      transitionEnd: {
        display: "none",
      },
    },
    // openContent: {
    //   height: "min-content",
    //   display: "flex",
    //   transition: {
    //     duration: 1
    //   },
    // },
    // closedContent: {
    //   display: "hidden",
    //   height: "0rem",
    //   transition: {
    //     duration: 1
    //   },
    // },
  };

  return (
    <motion.div
      initial={{ display: "none", height: 0 }}
      variants={withdrawVariants}
      animate={openers?.withdraw ? "openContainer" : "closedContainer"}
      className="fixed z-10 max-h-[60vh] bg-zinc-800 border-none bottom-0 rounded-t-xl shadow-[0_-3px_4px] shadow-[#5A31E1] flex-col items-center w-full whitespace-nowrap "
      ref={refContainer}
      exit={"closeContainer"}
    >
      <div
        className="flex flex-col items-center overflow-y-scroll scrollbar relative w-full "
      >
        <button
          className="sticky top-0 self-end z-10 text-xl right-8 md:right-12 font-bold"
          onClick={() => {
            handleOpeners("withdraw")
          }}
        >
          X
        </button>
        <div className="flex flex-col w-8/12 h-max gap-8 items-center">
          <h4 className=" text-2xl font-bold">Solicitar Retiro</h4>
          <div className="w-full">
            <div className="flex flex-col w-full">
              <label htmlFor="amount">Monto a Retirar</label>
              <InputSelect
                id="amount"
                type="number"
                min={0}
                inputStyle={`border-2 shadow-sm rounded-xl w-full h-16 text-xl p-2 ${errors?.withdrawal?.amount ? " border border-red-600 " : null} `}
                value={withdrawal?.amount?.toString()}
                onChange={handlerWithdrawal}
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="currency">Moneda de cambio</label>
              <select
                id="currency"
                className={`border-2 bg-zinc-800 shadow-sm rounded-xl w-full h-16 text-xl p-2  ${errors?.withdrawal?.currency ? " border border-red-600 " : null} `}
                defaultValue={0}
                onChange={handlerWithdrawal}
              >
                <option value={0} disabled>Seleccione moneda</option>
                <option value="USD">
                  US$
                </option>
                <option value="ARS">
                  AR$
                </option>
              </select>
            </div>
          </div>
          {
            withdrawal?.currency === "ARS" && (user.regFis === "RESPONSABLEINSCRIPTO" || user.regFis === "MONOTRIBUTO") ?
              <div className="flex flex-col items-center gap-8">
                <p className="text-lg font-semibold">Para procesar el pago cargá tu factura por {withdrawal.amount.toLocaleString('es-ar', { style: 'currency', currency: withdrawal.currency, minimumFractionDigits: 2 })}</p>
                <label htmlFor="pdf-Upload" className="flex text-xl font-bold">
                  <p>Adjuntar la Factura</p>
                  <SearchIcon />
                </label>
                <InputSelect
                  type="file"
                  id="pdf-Upload"
                  name="adjunto"
                  accept=".pdf"
                  inputStyle="hidden"
                  onChange={proccessImg}
                  multiple
                />
                {
                  errors.invoice && (
                    <label htmlFor="pdf-Upload" className="text-base font-normal" >Por favor seleccione y agregue el archivo correspondiente a la factura.</label>
                  )}
              </div>
              :
              null
          }
          <ComponentButton
            buttonStyle={
              (
                (errors?.invoice &&
                  (user?.regFis === "RESPONSABLE_INSCRIPTO" || user?.regFis === "MONOTRIBUTO") &&
                  withdrawal?.currency === "ARS"
                ) ||
                (errors?.withdrawal?.amount || !withdrawal?.amount) ||
                (errors?.withdrawal?.currency || !withdrawal?.currency)
              )
                ?
                "bg-[grey]"
                :
                ""
            }
            conditionDisabled={
              (
                (errors?.invoice &&
                  (user?.regFis === "RESPONSABLEINSCRIPTO" || user?.regFis === "MONOTRIBUTO") &&
                  withdrawal?.currency === "ARS"
                ) ||
                (errors?.withdrawal?.amount || !withdrawal?.amount) ||
                (errors?.withdrawal?.currency || !withdrawal?.currency)
              )
            }
            buttonEvent={handlerConfirmWithdraw}
            buttonText="Solicitar Retiro"
          />
          {
            fileInvoice.length > 0 ?
              <div className="">
                {renderPhotos(fileInvoice)}
              </div>
              :
              null
          }
          {modal && (
            <div className="fixed grid place-content-center top-0 left-0 h-screen w-screen bg-[#89898982] z-40">
              <div className="bg-zinc-800 shadow-md p-4 rounded-md flex flex-col gap-8 ">
                <h3>Confirme su Retiro</h3>
                <div>
                  <p>Por {withdrawal.amount.toLocaleString('es-ar', { style: 'currency', currency: withdrawal.currency, minimumFractionDigits: 2 })}</p>
                  <p>
                    {
                      ` 
                      Nuevo Saldo 
                      ${withdrawal.currency === "USD" ?
                        (balance.USD - withdrawal.amount).toLocaleString('es-ar', { style: 'currency', currency: withdrawal.currency, minimumFractionDigits: 2 }) :
                        (balance.ARS - withdrawal.amount).toLocaleString('es-ar', { style: 'currency', currency: withdrawal.currency, minimumFractionDigits: 2 })}
                      `
                    }
                  </p>
                  <span>El retiro se vera reflejado hasta dentro de 48hs</span>
                </div>
                {
                  !progressImg.status ?
                    <div className="flex self-end text-[#9272F1] gap-4">
                      <button
                        onClick={confirmWithdraw}
                        disabled={progressImg.status ? true : undefined}
                      >
                        Confirmar
                      </button>
                      <button onClick={() => showModal(false)}>Cancelar</button>
                    </div>
                    :
                    <progress value={progressImg} max={100}> {progressImg.value} %</progress>

                }
              </div>
            </div>
          )}
          {success && (
            <div className="fixed grid place-content-center top-0 left-0 h-screen w-screen bg-[#89898982] z-50">
              <div className="bg-zinc-800 w-[60vw] shadow-md p-4 rounded-md flex flex-col gap-8 ">
                <h3>Solicitud Enviada</h3>
                <div>
                  <p>Por {withdrawal.amount.toLocaleString('es-ar', { style: 'currency', currency: withdrawal.currency, minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex self-end text-[#9272F1] gap-4">
                  <button
                    onClick={() => {
                      handleOpeners("withdraw")
                    }}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          )}
          {
            errors?.invoiceSize.status === true ?
              <div className="">
                <div className="">
                  <div onClick={() => {
                    setFileInvoice([]),
                      setErrors({
                        ...errors,
                        invoiceSize: {
                          status: false,
                          files: []
                        }
                      }
                      )
                  }}>x</div>
                  <>
                    {
                      errors.invoiceSize.files.length > 1 ?
                        <h5>Los archivos:</h5>
                        :
                        <h5>El archivo: </h5>
                    }
                  </>
                  <>
                    {
                      errors.invoiceSize.files.map(invSize => {
                        return (
                          <p key={invSize.name}> {invSize.name} </p>
                        )
                      })
                    }
                  </>
                  <>
                    {
                      errors.invoiceSize.files.length > 1 ?
                        <h5>superan el limite de tamaño</h5>
                        :
                        <h5>supera el limite de tamaño.</h5>
                    }
                  </>
                </div>
              </div>
              :
              null
          }
        </div>
      </div>
    </motion.div>
  );
}

export default Withdraw