import { useState, useEffect } from 'react'

import { getDatabase, ref, get, query, orderByChild } from "firebase/database";
import { useAuth } from '../../../context/auth';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const Incomes = () => {
  const { user } = useAuth()
  const db = getDatabase()
  const [listIncomes, setListIncomes] = useState()
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
    if(user){
      const showList = async () => {
        const res = await get(query(ref(db, `salarysettlement/${user.uid}`, orderByChild("createdAt"))));
        if (res.hasChildren()) {
          setListIncomes([...Object.values(res.val())
            .map((val) => {
              const { date, ...resVal } = val
              const localeDate = new Date(date).toLocaleDateString()
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

  }, [])

  const handlerDropdownFilter = (e) => {
    if (!dropdownFilter?.[e.target.id]?.state) {
      let newList = []
      listIncomes.forEach(income => {
        if (!newList.find(filter => filter === Object.values(income[e.target.id]).map(res => res.clientName)[0])) {
          newList = [...newList, ...Object.values(income[e.target.id]).map(res => res.clientName)]
        }
      })
      setDropdownFilter({ ...dropdownFilter, [e.target.id]: { state: true, data: newList } })
    } else {
      setDropdownFilter({ ...dropdownFilter, [e.target.id]: { state: false, data: [] } })
    }
  }

  const filterIncome = (fil) => {
    const newIncome = listIncomes.filter(income => Object.values(income.client).map(res => res.clientName)[0] === fil)
    setListFilter(newIncome)
    setShowFilter(false)
  }

  const sort = (e) => {
    if (sorting === e.target.id) {
      const newList = [...listIncomes].reverse()
      setListIncomes(newList)
    } else {
      setSorting(e.target.id)
      setListIncomes(listIncomes.sort((a, b) => {
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
      }
      ))
    }
  }

  return (
    <>
      <div className="relative w-11/12">
        <div
          className='flex justify-end'
          onClick={() => setShowFilter(!showFilter)}
        >
          <p>Filtros</p>
          <FilterAltIcon />
        </div>
        {
          showFilter &&
          <div className="absolute flex flex-col w-72 h-60 overflow-y-auto scrollbar cursor-default z-20 border-2 border-black shadow-md top-full max-h-max right-0 bg-white p-4 rounded-2xl transition-all gap-4">
            <p className='text-red-400' onClick={() => setListFilter([])}>Limpiar</p>
            <div className="flex flex-col justify-between items-center">
              <div className="flex justify-between w-full items-center text-lg font-semibold p-2 bg-slate-200 rounded-xl">
                <label htmlFor="client" className='w-11/12'>Clientes:</label>
                <button
                  id="client"
                  className={`h-2 w-2 border-t border-r border-r-black border-t-black ${dropdownFilter.client.state ? "-rotate-45" : "rotate-[135deg]"}`}
                  onClick={(e) => handlerDropdownFilter(e)}
                >
                </button>
              </div>
              {
                dropdownFilter.client?.state &&
                <ul className="h-20 overflow-y-auto scrollbar rounded-b-md border border-slate-200 border-t-0 w-[95%] ">
                  {
                    dropdownFilter.client.data.map((fil, index) =>
                      <li
                        key={index}
                        className="pl-2 h-min min-h-[2.5rem] first:border-t-0 border-t-2 border-slate-200 list-none"
                        onClick={() => filterIncome(fil)}>{fil}
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
              <div id="client" onClick={(e) => sort(e)}>Cliente</div>
            </th>
            <th
              className='border border-slate-200'
            >
              <div id="nameProject" onClick={(e) => sort(e)}>Nombre de Proyecto</div>
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
                      <p>{income.client && Object.values(income.client).map(client => client.clientName)}</p>
                    </td>
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
              :
              listIncomes?.map((income, index) => {
                return (
                  <tr key={index} className='h-12'>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{income.client && Object.values(income.client).map(client => client.clientName)}</p>
                    </td>
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