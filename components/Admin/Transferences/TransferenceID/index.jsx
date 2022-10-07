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
import { getStorage, ref as sRef, getDownloadURL, listAll } from "firebase/storage";
import { useHost } from "../../../../context/host";
import { sendEmail } from "../../../../functions/sendMail"
import { useAuth } from "../../../../context/auth"
import ComponentButton from "../../../Elements/ComponentButton";

const TransferencesID = () => {
    const db = getDatabase()
    const router = useRouter()
    const { host } = useHost()
    const { user } = useAuth();
    const storage = getStorage()
    const [partner, setPartner] = useState({})
    const [selectedWithdraw, setSelectedWithdraw] = useState()
    const [fileInvoice, setFileInvoice] = useState([]);
    const [success, setSuccess] = useState(false)

    const { id: withdraw, u: partnerID } = router.query

    useEffect(() => {
        if(user){
            const getter = async () => {
                const resWithdraw = await get(ref(db, `withdrawals/${partnerID}/${withdraw}`))
                const balance = await get(ref(db, `balance/${partnerID}`))
                const resPartner = await get(ref(db, `users/${partnerID}`))
                setSelectedWithdraw(resWithdraw.val())
                setPartner({
                    balance: balance.val(),
                    data: resPartner.val()
                })
            }
            getter()
        }
    }, [])


    const handleTransference = () => {
        update(ref(db, `withdrawals/${partnerID}/${withdraw}`), { status: true })
            .then(res => {
                const pushNoti = push(ref(db, `notifications/${partnerID}`))
                set(pushNoti,
                    {
                        type: "TRANSFERENCE_CONFIRM",
                        withdrawal: selectedWithdraw.amount,
                        currency: selectedWithdraw.currency,
                        viewed: false,
                        open: false,
                        showCard: false,
                        createdAt: serverTimestamp()
                    }
                )
            }).then(res => {
                sendEmail(
                    {
                        from: {
                            email: user.email,
                            name: user.fullName
                        },
                        to: {
                            name: partner?.data?.fullName,
                            email: partner?.data?.email
                        },
                        subject: "Requests withdrawal",
                        redirect: `${host}/wallet`,
                        text: [
                            `Transfer completed`,
                            `of ${selectedWithdraw.currency} ${selectedWithdraw.amount}`,
                        ],
                    }
                )
                setSuccess(true)
            })
    }

    useEffect(() => {
        if(user){
            const storageRef = sRef(storage, `invoicePartners/${partnerID}/${withdraw}`)
            listAll(storageRef)
                .then(res => {
                    const arrPhotos = res.items.map(async (file) => {
                        const getPhoto = await getDownloadURL(sRef(storage, file._location.path))
                        return { url: getPhoto }
                    })
                    Promise.all(arrPhotos).then(res => {
                        const urlsInvoices = res.map(objUrl => objUrl.url)
                        setFileInvoice(urlsInvoices)
                    })
                })
        }
    }, [storage, user, partnerID, withdraw])

    return (
        <>
            {
                (router?.route === "/admin/transferences/[id]") &&
                <ComponentButton
                    isBack
                    routeBack={() => {

                        router.push({
                            pathname: "/admin/transferences",
                        });
                    }}
                />
            }
            <div className="flex flex-col items-center w-11/12 gap-8">
                <h1 className="text-xl font-bold">{partner?.data?.fullName}</h1>
                <div className="flex justify-between w-8/12 text-lg font-semibold">
                    <p>Amount: </p>
                    <p>{`${selectedWithdraw?.currency ?? ""} ${selectedWithdraw?.amount}`}</p>
                </div>
                {
                    fileInvoice?.map(file => {
                        return (
                            <a key={file} href={file} target="_blank" rel="noopener noreferrer" download>
                                <ComponentButton
                                    buttonText="Download"
                                />
                            </a>
                        )
                    })
                }
                <ComponentButton
                    buttonEvent={handleTransference}
                    buttonStyle=
                    {
                        selectedWithdraw?.status || success ?
                            "bg-gray" :
                            ""
                    }
                    conditionDisabled={selectedWithdraw?.status || success}
                    buttonText="Confirmar Transferencia"
                />

            </div>
        </>
    )
}

export default TransferencesID