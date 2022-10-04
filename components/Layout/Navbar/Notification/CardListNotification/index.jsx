import Link from "next/link"
import { getDatabase, ref, update } from "@firebase/database"

import { useAuth } from "../../../../../context/auth"

export const CardListNotification = ({ Icon, title, text, keyNoti, href, open, as }) => {
    const { user } = useAuth()
    const db = getDatabase()

    const openNotification = () => {
        update(ref(db, `notifications/${user.uid}/${keyNoti}`), { open: true });
    }
    return (
        <Link
            href={href}
            as={as}
            passHref
        >
            <a className="relative">
                <li
                    className="bg-slate-200 text-black rounded-md border-2 p-4 border-white shadow-sm shadow-slate-400"
                    onClick={() => openNotification()} 
                >
                    {
                        !open &&
                        <div className="absolute h-2 w-2 top-2 right-3 bg-blue-700 rounded-[50%]"></div>
                    }
                    <div className="max-h-8">
                        {
                            Icon &&
                            <Icon fill="black" height={32} whidt={32} />
                        }
                    </div>
                    <div>
                        <div>
                            <p>
                                {title}
                            </p>
                        </div>
                        <div className="w-48">
                            <p>
                                {text}
                            </p>
                        </div>
                    </div>
                </li>
            </a>
        </Link>

    )
}