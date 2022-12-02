import { useEffect, useState } from "react";
import Image from 'next/image'
import SearchIcon from '@mui/icons-material/Search';
import InputSelect from "../Elements/InputSelect"


export const MultiSelect = ({ label, options, searchFunction, setSelectState, selectState, placeholder, blockOption }) => {
  const [list, setList] = useState({})
  const [displayShow, setDisplayShow] = useState(false)


  useEffect(() => {
    setList(options)
  }, [options])

  const search = (e) => {
    setList(Object.values(options).filter(op =>
      op.name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1
    ))
  }


  const removeSelect = (select) => {
    const { [select]: _, ...restPartners } = selectState
    setSelectState(restPartners)
  }

  const addSelect = (option) => {
    setSelectState({ ...selectState, ...option })
  }

  return (
    <div onMouseLeave={() => { setDisplayShow(false), searchFunction && searchFunction() }} className="relative flex flex-col items-center w-full ">
      <p className="self-start font-bold">{label}</p>
      <div className="flex justify-between items-center appearance-none border rounded-xl w-full h-16 text-xl px-2"

      >
        <div className="flex overflow-x-auto scrollbar gap-4 w-[95%] cursor-pointer items-center text-black p-2" >
          {
            selectState ?
              Object.entries(selectState).map(([key, select]) => {
                return (
                  <div key={key} className="flex items-center w-max gap-4 text-white rounded-full px-3 bg-black ring-1">
                    <p>
                      {select?.name}
                    </p>
                    {
                      blockOption !== key &&
                      <button className="h-4 w-4 items-center text-xs bg-white font-bold text-black rounded-full" onClick={() => removeSelect(key)}>
                        x
                      </button>
                    }
                  </div>
                )
              })
              :
              placeholder
          }
        </div>
        <div onClick={() => setDisplayShow(!displayShow)}>
          <button className={`border-t-white border-t-2 border-r-2 border-r-white h-4 w-4 ${!displayShow ? "rotate-[135deg]" : "-rotate-45"}`} ></button>
        </div>
      </div>
      {
        displayShow &&
        <div className="absolute overflow-hidden bg-zinc-800 top-full w-[98%] rounded-b-lg">
          <div className="flex items-center h-12 w-full border-2 border-[#D4D4D4] grid-cols-[90%_auto]">
            <InputSelect
              type="search"
              inputStyle="h-4/5 text-base shadow-none"
              onChange={(e) => {
                searchFunction ?
                  (
                    searchFunction(e.target.value)
                  )
                  :
                  search(e)
              }}
            />
            <SearchIcon />
          </div>
          <div className="overflow-y-auto scrollbar rounded-b-lg max-h-48 border-[#D4D4D4] border-2">
            {
              list && Object.entries(list).map(([key, option]) => {
                return (
                  <div
                    key={key}
                    className="flex items-center h-12 font-bold text-lg pl-6"
                    onClick={() => addSelect({ [key]: option })}
                  >
                    <p>{option.name}</p>
                    {
                      option.img &&
                      <Image src={option.img} alt="option" />
                    }
                  </div>)
              })
            }
          </div>
        </div>
      }
    </div>
  );
};

