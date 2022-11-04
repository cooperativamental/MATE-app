import Image from "next/image"
import { CalendarIcon, ChevronRightIcon, UsersIcon } from '@heroicons/react/20/solid'
import { useState } from "react"

const positions = [
    {
        id: 1,
        name: 'Back End Developer',
        treasury: 'January 7, 2020',
        partners: [
            {
                name: 'Dries Vincent',
                email: 'dries.vincent@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                name: 'Lindsay Walton',
                email: 'lindsay.walton@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                name: 'Courtney Henry',
                email: 'courtney.henry@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                name: 'Tom Cook',
                email: 'tom.cook@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
        ],
    },
    {
        id: 2,
        title: 'Front End Developer',
        department: 'Engineering',
        closeDate: '2020-01-07',
        closeDateFull: 'January 7, 2020',
        partners: [
            {
                uid: "",
                name: 'Whitney Francis',
                email: 'whitney.francis@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                uid: "",
                name: 'Leonard Krasner',
                email: 'leonard.krasner@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                uid: "",
                name: 'Floyd Miles',
                email: 'floy.dmiles@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
        ],
    },
    {
        id: 3,
        title: 'User Interface Designer',
        department: 'Design',
        closeDate: '2020-01-14',
        closeDateFull: 'January 14, 2020',
        partners: [
            {
                uid: "",
                name: 'Emily Selman',
                email: 'emily.selman@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                uid: "",

                name: 'Kristin Watson',
                email: 'kristin.watson@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            {
                uid: "",

                name: 'Emma Dorsey',
                email: 'emma.dorsey@example.com',
                imageUrl:
                    'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
        ],
    },
]

export default function CardList({ list }) {
    const [ namePartner, setNamePartner ] = useState()


    return (
        <div className="bg-slate-400 shadow w-full sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
                {list.map((position) => (
                    <li key={position.id}>
                        <a href="#" className="block hover:bg-gray-50">
                            <div className="flex items-center px-4 py-4 sm:px-6">
                                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="truncate">
                                        <div className="flex text-sm">
                                            <p className="truncate font-medium text-indigo-600">{position.name}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <p>
                                                Treasury: {position.treasury}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 -space-x-2  ">
                                        {position.partners.map((partner) => {
                                            console.log(partner)
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
                                                                    partner.fullName.split(" ").map(sep => {
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
                                                            <p>{namePartner.fullName}</p>
                                                        </div>
                                                    }
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="ml-5 flex-shrink-0">
                                    {/* <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> */}
                                </div>
                            </div>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}
