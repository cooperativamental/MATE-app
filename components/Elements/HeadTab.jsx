  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
  export default function HeadBar({ tabs, event }) {
    return (
        <div className="w-8/12">
          <nav className="isolate flex w-full divide-x divide-gray-200 ring-1 ring-gray-200 rounded-lg shadow" aria-label="Tabs">
            {tabs?.map((tab, tabIdx) => (
              <a
                key={tab?.name}
                onClick={()=>event(tab.value)}
                className={classNames(
                  tab?.current ? 'text-white' : 'text-gray-500 hover:text-gray-700',
                  tabIdx === 0 ? 'rounded-l-lg' : '',
                  tabIdx === tabs?.length - 1 ? 'rounded-r-lg' : '',
                  'group relative min-w-0 flex-1 overflow-hidden bg-box-color py-4 px-4 text-sm font-medium cursor-pointer text-center hover:bg-rose-color focus:z-10'
                )}
                aria-current={tab?.current ? 'page' : undefined}
              >
                <span>{tab?.name}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    tab?.current ? 'bg-rose-color' : 'bg-transparent',
                    'absolute inset-x-0 bottom-0 h-1'
                  )}
                />
              </a>
            ))}
          </nav>
        </div>
    )
  }
  