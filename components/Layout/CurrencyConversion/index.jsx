import { useState, useEffect, useRef } from "react";
import {
  getDatabase,
  ref,
  set,
  push,
  serverTimestamp,
  get,
} from "firebase/database";

import { motion } from "framer-motion"
import { useAuth } from "../../../context/auth";
import { useDollarQuote } from "../../../context/dollarquote";
import { sendEmail } from "/functions/sendMail"
import { useHost } from "../../../context/host";
import { useBalance } from "../../../context/contextBalance";
import ComponentButton from "../../Elements/ComponentButton";
import InputSelect from "../../Elements/InputSelect"
import { useRules } from "../../../context/rulesApp";


const CurrencyConversion = () => {
  const db = getDatabase();
  const { user } = useAuth();
  const { rules: {currency: currency} } = useRules()
  const { host } = useHost()
  const { dollarQuote } = useDollarQuote()
  const { balance, openers, handleOpeners } = useBalance()
  const [currencyConversion, setCurrencyConversion] = useState({
    amount: 0,
    currency: ""
  });
  const [modal, showModal] = useState(false);
  const [success, setSuccess] = useState(false)
  const refContainer = useRef()
  const [errors, setErrors] = useState({
    currencyConversion: {
      currency: true,
      amount: true
    },
  });

  const confirmCurrencyConversion = () => {
    try {
      const newDate = new Date();
      const date = [
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
      ].join("-");
      const currencyconversionRef = ref(db, "currencyconversion/" + user.uid);
      const pushCurrencyconversion = push(currencyconversionRef);
      set(pushCurrencyconversion, {
        amount: currencyConversion.amount,
        currency: currencyConversion.currency,
        date: date,
        status: false,
        rejected: false,
        createdAt: serverTimestamp(),
      })
        .then(async (snapshot) => {
          setSuccess(true)
          get(ref(db, `users/`))
            .then(res => {
              const resValue = res.val()
              Object.entries(resValue).forEach(([key, valueUser]) => {
                if (valueUser.priority === "ADMIN") {
                  const pushNoti = push(ref(db, `notifications/${key}`))
                  set(pushNoti,
                    {
                      type: "CURRENCY_CONVERSION",
                      currency: currencyConversion.currency,
                      amount: currencyConversion.amount,
                      petitioner: user.fullName,
                      currencyconversionID: pushCurrencyconversion.key,
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
                        subject: "Requests currency exchange",
                        redirect: `${host}/admin/currencyconversion/${pushCurrencyconversion.key}?u=${user.uid}`,
                        text: [
                          `The partner ${user.fullName}`,
                          `Requests currency exchange for ${currencyConversion.currency} ${currencyConversion.amount}`,
                        ],
                      }
                    )
                  })
                }
              })
            })
        })
        .catch((error) => {
          // The write failed...
          console.error(error);
        });

    } catch (error) {
      alert(error)
    }
  }

  const handlerConfirmCurrenciConversion = () => {
    if (currencyConversion.amount < 1) {
      setErrors({
        ...errors,
        currencyConversion: {
          ...errors.currencyConversion,
          amount: true
        }
      });
    } else if (!currencyConversion.currency) {
      setErrors({
        ...errors,
        currencyConversion: {
          ...errors.currencyConversion,
          currency: true
        }
      });
    }
    else {
      showModal(true);
    }
  };

  const handlerCurrencyConversion = (e) => {
    setCurrencyConversion({
      ...currencyConversion,
      [e.target.id]: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
    })
    if (e.target.id === "amount") {
      setErrors({
        ...errors,
        currencyConversion: {
          ...errors.currencyConversion,
          amount: !(e.target.value > 0)
        }
      })
    } else if (e.target.id === "currency") {
      setErrors({
        ...errors,
        currencyConversion: {
          ...errors.currencyConversion,
          currency: !e.target.value
        }
      })
    }
  }

  const currencyConversionVariants = {
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
    openContent: {
      height: "min-content",
      display: "flex",
      transition: {
        duration: 1
      },
    },
    closedContent: {
      display: "hidden",
      height: "0rem",
      transition: {
        duration: 1
      },
    },
  };

  return (
    <motion.div
      initial={{ display: "none", height: 0 }}
      variants={currencyConversionVariants}
      animate={openers?.currencyConversion ? "openContainer" : "closedContainer"}
      className="fixed z-10 max-h-[60vh] bg-zinc-800 border-none bottom-0 rounded-t-xl shadow-[0_-3.5px_4px] shadow-[#5A31E1] flex-col items-center w-full whitespace-nowrap "
      ref={refContainer}
      exit={"closeContainer"}
    >
      <div
        className="flex flex-col items-center overflow-y-scroll scrollbar relative w-full "
      >
        <button
          className="sticky top-0 self-end z-10 text-xl right-12 font-bold"
          onClick={() => {
            handleOpeners("currencyConversion")
          }}
        >
          X
        </button>
        <div className="flex flex-col w-8/12 h-max gap-8 items-center">
          <h4 className=" text-2xl font-bold">Solicitar Cambio de Divisa</h4>
          <div className="w-full">
            <div>
              <div className="flex flex-col">
                <label htmlFor="currency">Moneda a vender</label>
                <select
                  id="currency"
                  defaultValue={0}
                  className="bg-zinc-800 border-2 shadow-sm rounded-xl w-full h-16 text-xl px-4"
                  onChange={handlerCurrencyConversion}
                >
                  <option value={0} disabled>Seleccione moneda</option>
                  <option
                    value="USD"
                    disabled={
                      !currency?.USD
                        ?
                        "disabled"
                        :
                        ""
                    }
                  >
                    US$
                  </option>
                  <option
                    value="ARS"
                    disabled={
                      !currency?.ARS
                        ?
                        "disabled" :
                        ""
                    }
                  >
                    AR$
                  </option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="amount">Monto a Convertir</label>
                <InputSelect
                  id="amount"
                  type="number"
                  min={0}
                  inputStyle="border-2 shadow-sm rounded-xl w-full h-16 text-xl px-4"
                  value={currencyConversion?.amount?.toString()}
                  onChange={handlerCurrencyConversion}
                />
              </div>
            </div>
            {
              currencyConversion.currency &&
              <div>
                <div className="flex flex-col">
                  <label htmlFor="amountToConvert">Valor aproximado del tipo de cambio a confirmar por administración.</label>
                  <InputSelect
                    id="amountToConvert"
                    type="text"
                    disabled
                    min={0}
                    readOnly={true}
                    inputStyle="border-2 shadow-sm rounded-xl w-full h-16 text-xl px-4"
                    value={`US$ ${Number(dollarQuote?.compra).toString()}`}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="amountToConvert">Valor convertido a moneda de Cambio</label>
                  <InputSelect
                    id="amountToConvert"
                    type="text"
                    disabled
                    min={0}
                    readOnly={true}
                    inputStyle="border-2 shadow-sm rounded-xl w-full h-16 text-xl px-4"
                    value={currencyConversion?.currency === "ARS" ? `US$ ${(currencyConversion?.amount / Number(dollarQuote?.compra?.replace(",", "."))).toFixed(2).toString()}` : `AR$ ${(currencyConversion?.amount * Number(dollarQuote?.compra?.replace(",", "."))).toFixed(2).toString()}`}
                  />
                </div>
              </div>
            }
          </div>
          {
            !!(currencyConversion?.currency && currencyConversion?.amount)
            &&
            < ComponentButton
              buttonStyle={
                (!currencyConversion?.currency || !currencyConversion?.amount) ?
                  "h-14 bg-[grey]"
                  :
                  "h-14 bg-[#5A31E1]"
              }
              disabled={
                (!currencyConversion?.currency || !currencyConversion?.amount) ?
                  "disabled"
                  :
                  undefined
              }
              buttonEvent={handlerConfirmCurrenciConversion}
              buttonText='Solicitar Cambio'
            />
          }
          {
            modal && (
              <div className="fixed grid place-content-center top-0 left-0 h-screen w-screen bg-[#89898982] z-40">
                <div className="bg-white shadow-md p-4 rounded-md flex flex-col gap-8 ">
                  <h3>Confirme su operación</h3>
                  <div>
                    <p>Por {currencyConversion.amount.toLocaleString('es-ar', { style: 'currency', currency: currencyConversion.currency, minimumFractionDigits: 2 })}</p>
                    <p>Nuevo saldo aproximado a confirmar </p>
                    <p>
                      {
                        currencyConversion.currency === "USD" ?
                          ` 
                          ${(
                            balance.ARS +
                            (currencyConversion?.amount * Number(dollarQuote?.compra?.replace(",", ".")))).toLocaleString('es-ar', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 })
                          } -
                          ${(balance.USD - currencyConversion?.amount).toLocaleString('es-ar', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
                        `
                          :
                          ` 
                        ${(balance.ARS - currencyConversion?.amount).toLocaleString('es-ar', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 })} -
                        ${(
                            balance.USD +
                            (currencyConversion?.amount / Number(dollarQuote?.compra?.replace(",", ".")))).toLocaleString('es-ar', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
                          }
                        `
                      }
                    </p>
                    <span>Espere la aprobación de Administración</span>
                  </div>
                  <button
                    onClick={confirmCurrencyConversion}
                  >
                    Confirmar
                  </button>
                  <button onClick={() => showModal(false)}>Cancelar</button>
                </div>
              </div>
            )
          }
          {success && (
            <div className="fixed grid place-content-center top-0 left-0 h-screen w-screen bg-[#89898982] z-50">
              <div className="bg-white w-[60vw] shadow-md p-4 rounded-md flex flex-col gap-8 ">
                <h3>Solicitud Enviada</h3>
                <div>
                  <p>Por {currencyConversion.amount.toLocaleString('es-ar', { style: 'currency', currency: currencyConversion.currency, minimumFractionDigits: 2 })}</p>
                </div>
                <div className="flex self-end text-[#5A31E1] gap-4">
                  <button
                    onClick={() => {
                      handleOpeners("currencyConversion")
                    }}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


export default CurrencyConversion