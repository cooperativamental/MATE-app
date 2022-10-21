import { useEffect, useState } from "react"
import { useRouter } from "next/router";

import {
    getDatabase,
    ref,
    update,
    set,
    push,
    get,
    serverTimestamp,
} from "firebase/database";
import { useDollarQuote } from "/context/dollarquote";
import { sendEmail } from "../../../../functions/sendMail"
import { useAuth } from "../../../../context/auth"
import { useHost } from "../../../../context/host";
import ComponentButton from "../../../Elements/ComponentButton";
import InputSelect from "../../../Elements/InputSelect";
import { Info } from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";

const CurrencyConversionID = () => {
    const db = getDatabase()
    const router = useRouter()
    const { user, firestore } = useAuth();
    const { host } = useHost()
    const [partner, setPartner] = useState({})
    const [selectedCurrencyConversion, setSelectedCurrencyConversion] = useState()
    const { dollarQuote } = useDollarQuote()
    const [valueDollar, setValueDollar] = useState()
    const [success, setSuccess] = useState({
        modal: false,
        status: false
    })
    const [rejected, setRejected] = useState({
        modal: false,
        status: false
    })
    const { id: currencyconversionID, u: partnerID } = router.query

    useEffect(() => {
        if(user){
            const getter = async () => {
                const resCurrencyConversion = await get(ref(db, `currencyconversion/${partnerID}/${currencyconversionID}`))
                const balance = await get(ref(db, `balance/${partnerID}`))
                const resPartner = await getDoc(doc(firestore, "users", partnerID))
                setSelectedCurrencyConversion(resCurrencyConversion.val())
                setPartner({
                    balance: balance.val(),
                    data: resPartner.val()
                })
            }
            getter()
        }
    }, [])


    const confirmConversion = () => {
        update(ref(db, `currencyconversion/${partnerID}/${currencyconversionID}`), { status: true })
            .then(res => {
                update(
                    ref(db, `/balance/${partnerID}`),
                    (selectedCurrencyConversion?.currency === "USD" ?
                        {
                            balance: Number(partner.balance.balance + Number((selectedCurrencyConversion.amount * valueDollar).toFixed(2))),
                            balanceUSD: Number((partner.balance.balanceUSD - selectedCurrencyConversion.amount).toFixed(2))
                        }
                        :
                        {
                            balanceUSD: Number(partner.balance.balanceUSD + Number((selectedCurrencyConversion.amount / valueDollar).toFixed(2))),
                            balance: Number((partner.balance.balance - selectedCurrencyConversion.amount).toFixed(2))
                        }
                    )
                )
                const pushNoti = push(ref(db, `notifications/${partnerID}`))
                set(pushNoti,
                    {
                        type: "CURRENCY_CONVERSION_CONFIRM",
                        amount: selectedCurrencyConversion.amount,
                        currency: selectedCurrencyConversion.currency,
                        viewed: false,
                        open: false,
                        showCard: false,
                        createdAt: serverTimestamp()
                    }
                ).then(res => {
                    sendEmail({
                        from: {
                            email: user.email,
                            name: user.fullName
                        },
                        to: {
                            email: partner.data.email,
                            name: partner.data.fullName
                        },
                        subject: "Confirmación de cambio",
                        redirect: `${host}/wallet`,
                        text: [
                            `El cambio de ${selectedCurrencyConversion.currency} ${selectedCurrencyConversion.amount} ha sido confirmado`,
                        ],
                    })
                })
            }).then(res => {
                setSuccess({
                    modal: true,
                    status: true
                })
            })
    }

    const rejectConversion = () => {
        update(ref(db, `currencyconversion/${partnerID}/${currencyconversionID}`), { rejected: true })
            .then(res=> {
                const pushNoti = push(ref(db, `notifications/${partnerID}`))
                set(pushNoti,
                    {
                        type: "CURRENCY_CONVERSION_REJECT",
                        amount: selectedCurrencyConversion.amount,
                        currency: selectedCurrencyConversion.currency,
                        viewed: false,
                        open: false,
                        showCard: false,
                        createdAt: serverTimestamp()
                    }
                ).then(res => {
                    sendEmail({
                        from: {
                            email: user.email,
                            name: user.fullName
                        },
                        to: {
                            email: partner.data.email,
                            name: partner.data.fullName
                        },
                        subject: "Rechazo de cambio",
                        redirect: `${host}/wallet`,
                        text: [
                            `El cambio de ${selectedCurrencyConversion.currency} ${selectedCurrencyConversion.amount} no ha sido confirmado`,
                        ],
                    })
                })
                setRejected({
                    modal: true,
                    status: true
                })
            })
    }

    const handleValueDollar = (e) => {
        setValueDollar(Number(e.target.value))
    }

    return (
        <>
            {
                (router?.route === "/admin/currencyconversion/[id]") &&
                <ComponentButton
                    isBack
                    routeBack={() => {
                        router.push({
                            pathname: "/admin/currencyconversion",
                            query: {
                                team: partner.data.team,
                                partner: partnerID
                            }
                        });
                    }}
                />
            }
            <div className="flex flex-col w-11/12 h-max items-center">
                <div className="flex flex-col w-8/12 items-center gap-4 ">
                    <h1 className="text-xl font-bold">{partner?.data?.fullName}</h1>
                    <div className="flex w-full justify-between text-lg font-semibold">
                        <p>Monto: </p>
                        <p>
                            {
                                `
                                ${selectedCurrencyConversion?.amount
                                    .toLocaleString('es-ar', { style: 'currency', currency: selectedCurrencyConversion?.currency, minimumFractionDigits: 2 })
                                }`
                            }
                        </p>
                    </div>
                    <div className="flex w-full justify-between text-lg font-semibold">
                        <p>Valor referencia del tipo de cambio: </p>
                        <p>$ {dollarQuote?.venta}</p>
                    </div>
                    <div className="flex w-full justify-between text-lg font-semibold">
                        <p>Monto aproximado: </p>
                        <p>{
                            selectedCurrencyConversion?.currency === "USD" ?
                                `AR$ ${(selectedCurrencyConversion?.amount * dollarQuote?.venta
                                    .replace(",", "."))
                                    .toLocaleString(undefined, { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 })}` :
                                `US$ ${(selectedCurrencyConversion?.amount /
                                    dollarQuote?.venta
                                        .replace(",", "."))
                                    .toLocaleString(undefined, { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 })}`
                        }
                        </p>
                    </div>
                    {
                        (selectedCurrencyConversion?.status || success.status) ?
                        null
                            :
                        <div className="flex flex-col font-semibold text-normal">
                            <label>Confirme el valor del tipo de cambio.</label>
                            <InputSelect
                                type="number"
                                onChange={handleValueDollar}
                                placeholder={dollarQuote?.venta}
                            />
                        </div>
                    }
                    {
                        (valueDollar) &&
                        <div className="flex w-full justify-between font-semibold text-lg">
                            <p>Monto final a cambiar: </p>
                            <p>
                                {
                                    `${(selectedCurrencyConversion?.currency === "USD" ?
                                        selectedCurrencyConversion?.amount * valueDollar :
                                        selectedCurrencyConversion?.amount / valueDollar
                                    )
                                        .toLocaleString('es-ar', { style: 'currency', currency: selectedCurrencyConversion?.currency, minimumFractionDigits: 2 })}`
                                }

                            </p>
                        </div>
                    }
                    <ComponentButton
                        buttonEvent={confirmConversion}
                        conditionDisabled={(selectedCurrencyConversion?.status || !valueDollar || success.status) }
                        buttonStyle={
                            (selectedCurrencyConversion?.status || !valueDollar || success.status) ?
                                "bg-gray-400" :
                                ""
                        }
                        buttonText="Confirmar Cambio de Divisa"
                    />
                    <ComponentButton
                        buttonEvent={rejectConversion}
                        conditionDisabled={( rejected.status || selectedCurrencyConversion?.status || selectedCurrencyConversion?.rejected ) }
                        buttonStyle={
                            ( rejected.status || selectedCurrencyConversion?.status || selectedCurrencyConversion?.rejected ) ?
                                "bg-gray-400" :
                                ""
                        }
                        buttonText="Cancelar Cambio de Divisa"
                    />
                </div>
            </div>
            {(success.modal || rejected.modal) && (
                <div className="fixed grid place-content-center top-0 left-0 h-screen w-screen bg-[#89898982] z-40">
                    <div className="bg-white w-max shadow-[#5A31E1] shadow-md p-4 rounded-md flex flex-col gap-8 ">
                        <h3>Operación de cambio rechazada</h3>
                        <button
                            className="self-end text-[#5A31E1]"
                            onClick={() => {
                                setRejected({
                                    ...success,
                                    modal: false
                                })
                            }}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

        </>
    )
}

export default CurrencyConversionID