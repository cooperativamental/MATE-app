import Image from "next/image"
import { CalendarIcon, ChevronRightIcon, UsersIcon } from '@heroicons/react/20/solid'
import { useState } from "react"
import ComponentButton from "./ComponentButton"

export default function CardList({ list }) {
    const [namePartner, setNamePartner] = useState()

    return (
        <div className="bg-slate-400 shadow w-full sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {
                    list.map((position) => {
                        return (
                            <li
                                key={position.id}
                                onClick={position.redirect}
                            >
                                <a href="#" className="block hover:bg-gray-50">
                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="truncate">
                                                <div className="flex text-sm">
                                                    <p className="truncate font-medium text-indigo-600">{position.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center overflow-hidden text-ellipsis text-gray-500">
                                                <p className=" whitespace-nowrap float-right transition-all duration-500 hover:float-left">
                                                    {position.info}
                                                </p>
                                            </div>
                                            {
                                                position?.partners &&
                                                <div className="flex mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 -space-x-2  ">
                                                    {position?.partners?.map((partner) => {
                                                        return (
                                                            <div
                                                                key={partner.id}
                                                                className="relative flex flex-initial p-1 items-center justify-center w-8 h-8 rounded-full  bg-slate-500 ring-2 ring-white"
                                                                onMouseOver={() => {
                                                                    setNamePartner({
                                                                        ...partner,
                                                                        key: `${partner.id}${position.id}`
                                                                    })
                                                                }}
                                                                onMouseOut={() => {
                                                                    setNamePartner()
                                                                }}
                                                            >
                                                                {
                                                                    partner.imageUrl ?
                                                                        <Image
                                                                            layout="responsive"
                                                                            width={1}
                                                                            height={1}
                                                                            key={partner.email}
                                                                            src={partner.imageUrl}
                                                                            alt={partner.name}
                                                                        />
                                                                        :
                                                                        <p className=" text-white font-bold">
                                                                            {
                                                                                partner.name.split(" ").map(sep => {
                                                                                    return (
                                                                                        sep[0]
                                                                                    )
                                                                                })
                                                                            }
                                                                        </p>
                                                                }
                                                                {
                                                                    namePartner?.key === `${partner.id}${position.id}` &&
                                                                    <div className="absolute text-black font-bold outline-double outline-4 outline-white -top-14 h-14 rounded-md bg-slate-500 z-20 p-2">
                                                                        <p>{namePartner.name}</p>
                                                                    </div>
                                                                }
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            }
                                            {
                                                position?.button &&
                                                <ComponentButton
                                                    buttonEvent={position?.button}
                                                    buttonText="Start Project"
                                                    buttonStyle="w-min !border-white !border-2 text-slate-700 hover:text-white"
                                                />
                                            }
                                        </div>
                                    </div>
                                </a>
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}
