import { useState, useEffect, useRef } from 'react'

import { getDatabase, ref, get, query, orderByChild } from "firebase/database";
import { useAuth } from '../../../context/auth';

import FilterAltIcon from '@mui/icons-material/FilterAlt';

const Incomes = () => {
    const db = getDatabase()
    const { user } = useAuth()
    const refContainer = useRef()
    const [invoicesDiscount, setListInvoiceDiscount] = useState()
    const [showFilter, setShowFilter] = useState(false)
    const [sorting, setSorting] = useState(undefined)

    const [dropdownFilter, setDropdownFilter] = useState({
        client: {
            state: false,
            data: []
        }
    })

    const [listFilter, setListFilter] = useState([])

    useEffect(() => {
        if (user) {
            const showList = async () => {
                const res = await get(query(ref(db, `invoiceDiscount/${user?.uid}`, orderByChild("createdAt"))));
                if (res.hasChildren()) {
                    setListInvoiceDiscount([...Object.values(res.val())
                        .map((val) => {
                            const { date, ...resVal } = val
                            const localeDate = new Date(date).toLocaleDateString('es-ar')
                            return {
                                ...resVal,
                                date: localeDate
                            }
                        })
                        .reverse()])
                }
            }
            showList()
        }
    }, [user])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (refContainer.current && !refContainer.current.contains(event.target)) {
                setShowFilter(false)
            }

        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [refContainer]);

    const handlerDropdownFilter = (e) => {
        if (!dropdownFilter?.[e.target.id]?.state) {
            let newList = []
            invoicesDiscount.forEach(income => {
                if (!newList.find(filter => filter === Object.values(income[e.target.id]).map(res => res.clientName)[0])) {
                    newList = [...newList, ...Object.values(income[e.target.id]).map(res => res.clientName)]
                }
            })
            setDropdownFilter({ ...dropdownFilter, [e.target.id]: { state: true, data: newList } })
        } else {
            setDropdownFilter({ ...dropdownFilter, [e.target.id]: { state: false, data: [] } })
        }
    }

    const filter = (fil) => {
        const newWithdraw = invoicesDiscount.filter(withdraw => {
            const dateFilter = new Date()
            dateFilter.setMonth(fil > 1 ? (dateFilter.getMonth() - fil - 1) : (dateFilter.getMonth() - fil))
            dateFilter.setDate(1)
            const dateWithdraw = new Date(withdraw.date)
            if (dateFilter < dateWithdraw) {
                return true
            } else {
                return false
            }
        })
        setListFilter(newWithdraw)
        setShowFilter(false)
    }

    const sort = (e) => {
        if (sorting === e.target.id) {
            const newList = [...invoicesDiscount].reverse()
            setListInvoiceDiscount(newList)
        } else {
            setSorting(e.target.id)
            const sortWithdraws = invoicesDiscount.sort((a, b) => {
                const alow = a[e.target.id]
                const blow = b[e.target.id]
                typeof alow === "string" && a[e.target.id].toLowerCase()
                typeof blow === "string" && b[e.target.id].toLowerCase()
                if (!alow && blow) {
                    return -1
                }
                if (alow > blow) {
                    return 1;
                }
                if (alow < blow) {
                    return -1
                }
                return 0
            })
            setListInvoiceDiscount(sortWithdraws)
        }
    }

    return (
        <>
            <div ref={refContainer} className="relative w-11/12">
                <div
                    className='flex justify-end'
                    onClick={() => setShowFilter(!showFilter)}
                >
                    <p>Filtros</p>
                    <FilterAltIcon />
                </div>                {
                    showFilter &&
                    <div className="absolute flex flex-col w-72 h-60 overflow-y-auto scrollbar cursor-default z-20 border-2 border-black shadow-md top-full max-h-max right-0 bg-white p-4 rounded-2xl transition-all gap-4">
                        <p className='text-red-400' onClick={() => setListFilter([])}>Limpiar</p>
                        <div className="flex flex-col justify-between items-center">
                            <div className="flex justify-between w-full items-center text-lg font-semibold p-2 bg-slate-200 rounded-xl">
                                <label htmlFor="date" className='w-11/12'>Rango de Fechas: </label>
                                <button
                                    id="date"
                                    className={`h-2 w-2 border-t border-r border-r-black border-t-black ${dropdownFilter ? "-rotate-45" : "rotate-[135deg]"}`}
                                    onClick={(e) => dropdownFilter === "date" ? setDropdownFilter("") : setDropdownFilter(e.target.id)}
                                >
                                </button>
                            </div>
                            {
                                dropdownFilter === "date" &&
                                <ul className="h-20 overflow-y-auto scrollbar rounded-b-md border border-slate-200 border-t-0 w-[95%] ">
                                    {
                                        [1, 3, 6, 9, 12].map((fil, index) =>
                                            <li
                                                className="pl-2 h-min min-h-[2.5rem] first:border-t-0 border-t-2 border-slate-200 list-none"
                                                key={index}
                                                onClick={() => filter(fil)}
                                            >
                                                {fil === 1 ? `Ultimo mes` : `Ultimos ${fil} meses`}
                                            </li>
                                        )
                                    }
                                </ul>
                            }
                        </div>

                    </div>
                }
            </div>
            <table className="w-full text-center table-fixed border-separate border border-slate-300">
                <thead>
                    <tr className='h-12'>
                        <th
                            className='border border-slate-200'
                        >
                            <div id="businessName" onClick={(e) => sort(e)}>Razon Social</div>
                        </th>
                        <th
                            className='border border-slate-200'
                        >
                            <div id="date" onClick={(e) => sort(e)}>Día</div>
                        </th>
                        <th
                            className='border border-slate-200'
                        >
                            <div id="amount">Monto</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        listFilter.length ?
                            listFilter.map((income, index) => {
                                return (
                                    <tr key={index} className='h-12'>
                                        <td
                                            className='border border-slate-100'
                                        >
                                            <p>{income.businessName}</p>
                                        </td>
                                        <td
                                            className='border border-slate-100'
                                        >
                                            <p>{income.date}</p>
                                        </td>
                                        <td
                                            className='border border-slate-100'
                                        >
                                            <p>{income.amount}</p>
                                        </td>
                                    </tr>
                                )
                            }
                            )
                            :
                            invoicesDiscount?.map((income, index) => {
                                return (
                                    <tr key={index} className='h-12'>
                                        <td
                                            className='border border-slate-100'
                                        >
                                            <p>{income.nameProject}</p>
                                        </td>
                                        <td
                                            className='border border-slate-100'
                                        >
                                            <p>{income.date}</p>
                                        </td>
                                        <td
                                            className='border border-slate-100'
                                        >
                                            <p>{income.amount}</p>
                                        </td>
                                    </tr>
                                )
                            }
                            )
                    }
                </tbody>
            </table>

        </>
    )
}

export default Incomes