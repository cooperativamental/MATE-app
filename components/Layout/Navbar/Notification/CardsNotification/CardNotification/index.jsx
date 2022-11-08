import Link from "next/link"
import { getDatabase, ref, update } from "@firebase/database"

import { useAuth } from "../../../../../../context/auth"

export const CardNotification = ({ Icon, title, text, keyNoti, href }) => {
    const { user } = useAuth()
    const db = getDatabase()

    const openNotification = () => {
        update(ref(db, `notifications/${user.uid}/${keyNoti}`), { open: true });
    }

    const close = () => {
        update(ref(db, `notifications/${user.uid}/${keyNoti}`), { showCard: true })
    }

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 rounded-md overflow-hidden bg-slate-200 text-black z-50 w-80 h-40 min-w-max min-h-max max-h-[25vh] max-w-[90vw]" >
            <Link
                href={href}
                as={undefined}
                passHref
                onClick={() => openNotification()}
            >
                <a>
                    <div className="relative flex font-bold w-full gap-4 items-center bg-slate-300  justify-between px-4 py-2" >
                        <div className="flex gap-4">
                            {
                                Icon &&
                                <div>
                                    <Icon />
                                </div>
                            }
                            <p>
                                {title}
                            </p>
                        </div>
                        <button className="font-bold" onClick={close}>x</button>

                    </div>
                    <div className="p-4 font-normal">
                        <p>
                            {text}
                        </p>
                    </div>
                </a>
            </Link>
        </div>
    )
}