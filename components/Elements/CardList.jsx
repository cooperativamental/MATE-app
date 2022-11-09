import Image from "next/image"
import { CalendarIcon, ChevronRightIcon, UsersIcon } from '@heroicons/react/20/solid'
import { useState } from "react"
import ComponentButton from "./ComponentButton"

export default function CardList({ list }) {
    const [namePartner, setNamePartner] = useState()

    return (
        <div className="bg-box-color shadow w-full rounded-lg sm:rounded-md">
            <ul role="list" className="divide-y divide-rose-color">
                {
                    list.map((position) => {
                        return (
                            <li
                                key={position.id}
                                onClick={position.redirect}
                            >
                                <a href="#" className="block hover:bg-violet-color">
                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="truncate w-3/12">
                                                <div className="flex text-lg">
                                                    <p className="truncate font-medium text-white">{position.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex w-3/12 items-center overflow-hidden text-sm text-yellow-color">
                                                <p className=" whitespace-nowrap float-right transition-all duration-500 hover:float-left">
                                                    {position.info}
                                                </p>
                                            </div>
                                            {
                                                position?.partners &&
                                                <div className="flex w-3/12 mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 -space-x-2  ">
                                                    {position?.partners?.map((partner) => {
                                                        return (
                                                            <div
                                                                key={partner.id}
                                                                className="relative flex flex-initial p-1 items-center justify-center w-8 h-8 rounded-full font-thin bg-orange-color"
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
                                                                        <p className=" text-white font-light">
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
                                                                    <div className="absolute text-white font-light outline-4 outline-white -top-14 h-14 rounded-md bg-orange-color z-20 p-2">
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
                                                <div className="w-3/12">
                                                    <ComponentButton
                                                        buttonEvent={position?.button}
                                                        buttonText="Start a project"
                                                        buttonStyle="w-min text-white text-sm hover:text-white"
                                                    />
                                                </div>
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
