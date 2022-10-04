import { useState, useEffect, useRef } from "react";
import {
  getDatabase,
  ref,
  get,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";
import { useAuth } from '../../../context/auth';
import FilterAltIcon from '@mui/icons-material/FilterAlt';


const CurrencyConversion = ({ data }) => {
  const db = getDatabase();
  const { user } = useAuth()
  const refContainer = useRef()
  const [listCurrencyConversion, setCurrencyConversion] = useState()
  const [sorting, setSorting] = useState(undefined)
  const [showFilter, setShowFilter] = useState(false)
  const [dropdownFilter, setDropdownFilter] = useState(false)

  const [listFilter, setListFilter] = useState([])

  useEffect(() => {
    if(user){
      const showList = async () => {
        const res = await get(query(ref(db, `currencyconversion/${user.uid}`), limitToLast(30), orderByChild("createdAt")));
        if (res.hasChildren()) {
          setCurrencyConversion([...Object.values(res.val())
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

  const filterWithdraw = (fil) => {
    const newWithdraw = listCurrencyConversion.filter(data => {
      const dateFilter = new Date()
      dateFilter.setMonth(fil > 1 ? (dateFilter.getMonth() - fil - 1) : (dateFilter.getMonth() - fil))
      dateFilter.setDate(1)
      const dateWithdraw = new Date(data.date)
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
      const newList = [...listCurrencyConversion].reverse()
      setCurrencyConversion(newList)
    } else {
      setSorting(e.target.id)
      const sortWithdraws = listCurrencyConversion.sort((a, b) => {
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
      setCurrencyConversion(sortWithdraws)
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
        </div>
        {
          showFilter &&
          <div className="absolute flex flex-col w-72 h-60 overflow-y-auto scrollbar cursor-default z-20 border-2 border-black shadow-md top-full max-h-max right-0 bg-white p-4 rounded-2xl transition-all gap-4">
            <p className='text-red-400' onClick={() => setListFilter([])}>Limpiar</p>
            <div className="flex flex-col justify-between items-center">
              <div className="flex justify-between w-full items-center text-lg font-semibold p-2 bg-slate-200 rounded-xl">
                <label htmlFor="date" className='w-11/12'>Clientes: </label>
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
                        key={index}
                        className="pl-2 h-min min-h-[2.5rem] first:border-t-0 border-t-2 border-slate-200 list-none"
                        onClick={() => filterWithdraw(fil)}
                      >
                        {
                          fil === 1
                            ?
                            `Ultimo mes`
                            :
                            `Ultimos ${fil} meses`
                        }
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
              <div id="date" onClick={(e) => sort(e)}>Fecha Retiro</div>
            </th>
            <th
              className='border border-slate-200'
            >
              <div id="amount" onClick={(e) => sort(e)} >Monto</div>
            </th>
            <th
              className='border border-slate-200'
            >
              <div id="status" onClick={(e) => sort(e)} >Estado</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {
            listFilter.length ?
              listFilter.map((currencyconversion, index) => {

                const status = () => {
                  if(currencyconversion.status) {
                    return "Rechazado"
                  }
                  if(currencyconversion.status){
                    return "Convertido"
                  } 
                  return "Solicitado"
                }
                return (
                  <tr key={index} className='h-12'>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{currencyconversion.date}</p>
                    </td>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{currencyconversion.amount.toLocaleString('es-ar', { style: 'currency', currency: currencyconversion.currency, minimumFractionDigits: 2 })}</p>
                    </td>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{status()}</p>
                    </td>
                  </tr>
                );
              })
              :
              listCurrencyConversion?.map((currencyconversion, index) => {
                const status = () => {
                  if(currencyconversion.status) {
                    return "Rechazado"
                  }
                  if(currencyconversion.status){
                    return "Convertido"
                  } 
                  return "Solicitado"
                }
                return (
                  <tr key={index} className='h-12'>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{currencyconversion.date}</p>
                    </td>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{currencyconversion.amount.toLocaleString('es-ar', { style: 'currency', currency: currencyconversion.currency, minimumFractionDigits: 2 })}</p>
                    </td>
                    <td
                      className='border border-slate-100'
                    >
                      <p>{status()}</p>
                    </td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
      {/* <button onClick={() => confirm(transfer)}>Confirmar</button>
        <button onClick={() => cancelTransfer()}>Cancelar</button> */}

    </>
  );
};

export default CurrencyConversion;
