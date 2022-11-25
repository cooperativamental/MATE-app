import { useState } from "react"
import { Image } from "next/image"
import { PlusIcon, MinusIcon } from '@heroicons/react/20/solid'

export const MultiSelectPartners = ({ options, selectState, searchFunction, setOptions,  setSelectState, blockOption }) => {

  const [fieldSearch, setFieldSearch] = useState()

  return (
    <div className="w-full">
      <div>
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h2 className="mt-2 text-lg font-medium">Add team members</h2>
        </div>
        <div className="flex flex-col sm:flex-row w-full">

          <div className="flex w-full">
            <div className="relative rounded-md shadow-sm w-full">
              <input
                type="text"
                name="address"
                id="address"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchFunction(fieldSearch)
                  }
                }}
                onChange={(e) => setFieldSearch(e.target.value)}
                className="block w-full rounded-md border-gray-300 text-black focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter email or Phantom wallet address."
              />
              {/* <div className="absolute inset-y-0 right-0 flex items-center">
                <span className="h-4 w-px bg-gray-200" aria-hidden="true" />
                <label htmlFor="role" className="sr-only">
                  Role
                </label>
              </div> */}
            </div>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
            <button
              onClick={() => searchFunction(fieldSearch)}
              className="block w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Search Mate
            </button>
          </div>
        </div>

      </div>
      <div className="mt-10">
        <h3 className="text-sm font-medium text-gray-500">Team Admin [Up next delegate admin to your MultiSign or DAO]</h3>
        <ul role="list" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {
            options &&
            Object.entries(options).map(([partnerKey, partner]) => (
              <li key={partnerKey}>
                <button
                  type="button"
                  className={`group flex w-full items-center h-12 justify-between space-x-3 rounded-full border border-gray-300 p-2 text-left shadow-sm hover:bg-gray-50 hover:text-gray-900 ${selectState?.[partnerKey] && "outline-none ring-2 ring-indigo-500 ring-offset-2"}`}
                >
                  <span className="flex min-w-0 flex-1 items-center space-x-3">
                    <span className="block flex-shrink-0">
                      {
                        partner.imageUrl &&
                        <Image className="h-10 w-10 rounded-full" src={partner.imageUrl} alt="" />
                      }
                    </span>
                    <span className="block min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium ">{partner.name}</span>
                      <span className="block truncate text-sm font-medium text-gray-500">{partner.role}</span>
                    </span>
                  </span>
                  {
                    !blockOption?.includes(partnerKey) &&
                    <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center">
                      <PlusIcon
                        onClick={() => {
                          const { [partnerKey]: _, ...resOption } = options
                          setOptions(resOption)
                          setSelectState({
                            ...selectState,
                            [partnerKey]: partner
                          })
                        }}
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" 
                      />

                    </span>
                  }
                </button>
              </li>
            ))
          }
        </ul>
      </div>
      <div className="mt-10">
        <ul role="list" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {
            options &&
            Object.entries(selectState).map(([partnerKey, partner]) => (
              <li key={partnerKey}>
                <button
                  type="button"
                  className={`group flex w-full h-12 items-center justify-between space-x-3 rounded-full border border-gray-300 p-2 text-left shadow-sm hover:bg-gray-50 hover:text-gray-900 ${selectState?.[partnerKey] && "outline-none ring-2 ring-indigo-500 ring-offset-2"}`}
                >
                  <span className="flex min-w-0 flex-1 items-center space-x-3">
                    <span className="block flex-shrink-0">
                      {
                        partner.imageUrl &&
                        <Image className="h-10 w-10 rounded-full" src={partner.imageUrl} alt="" />
                      }
                    </span>
                    <span className="block min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium ">{partner.name}</span>
                      <span className="block truncate text-sm font-medium text-gray-500">{partner.role}</span>
                    </span>
                  </span>
                  {
                    !blockOption?.includes(partnerKey) &&
                    <span className="inline-flex w-10 flex-shrink-0 items-center justify-center">
                      <MinusIcon
                        onClick={() => {
                          const { [partnerKey]: _, ...resPartners } = selectState
                          setSelectState({
                            ...resPartners
                          })
                        }}
                        className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true"
                      />
                    </span>
                  }
                </button>
              </li>
            ))
          }
        </ul>
      </div>
    </div>
  )
}