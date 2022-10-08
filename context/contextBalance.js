import { createContext, useState, useEffect, useContext } from "react"
import { getDatabase, get, ref, onValue } from "firebase/database";
import { useAuth } from "./auth"

const BalanceContext = createContext({
    balance: {
        USD: 0,
        ARS: 0
    },
    scheduledIngress: {
      total:{
        ARS: 0,
        USD: 0
      },
      amounProjects: 0
    },
    openers: {
      withdraw: false,
      currencyConversion: false
    },
    handleOpeners: (open)=>{}
})

const BalanceProvider = ({children}) => {
    const { user } = useAuth()
    const db = getDatabase()
    const [balance, setBalance] = useState({
        ARS: 0,
        USD: 0
    })
    const [scheduledIngress, setScheduledIngress] = useState({
        total: {},
        amounProjects: 0
    })
    const [openers, setOpeners] = useState({
      withdraw: false,
      currencyConversion: false
    })

    useEffect(() => {
        if (user) {
          const bal = ref(db, "balance/" + user?.uid);
          const unsubscribe = onValue(bal, (snapshot) => {
            const resValue = snapshot.val();
            setBalance({
                ARS: resValue?.balance,
                USD: resValue?.balanceUSD
            });    
          });
          const amountRef = ref(db, `users/${user?.uid}/projects`)
          const unsub = onValue(amountRef, (res) => {
            if (res.hasChildren()) {
              const allAmountPrj = Object.entries(res.val()).map(async ([key, value]) => {
                const getPrj = await get(ref(db, `projects/${key}`))
                const status = ["ANNOUNCEMENT", "REVISION_PARTNER", "REVISION_CONFIRM", "PAID"]
                if (!status.find(sts => sts === getPrj?.val()?.status)) {
                  if (value.amount > value.salarysettlement && value.salarysettlement) {
                    if (getPrj.val().currency === "USD") {
                      return { USD: value.amount - value.salarysettlement }
                    } else if (getPrj.val().currency === "ARS") {
                      return { ARS: value.amount - value.salarysettlement }
                    }
                  } else {
                    if (getPrj.val().currency === "USD") {
                      return { USD: value.amount }
                    } else if (getPrj.val().currency === "ARS") {
                      return { ARS: value.amount }
                    }
                  }
                }
              })
              Promise.all(allAmountPrj).then(amountCurrency => {
                let amounProjects = 0
                let sumAmountToProject = {
                  USD: 0,
                  ARS: 0
                }
                amountCurrency.forEach(currency => {
                  if (currency) {
                    if (currency.USD) {
                      sumAmountToProject = {
                        ...sumAmountToProject,
                        USD: sumAmountToProject.USD += currency.USD
                      }
                      amounProjects++
                    } else if (currency.ARS) {
                      sumAmountToProject = {
                        ...sumAmountToProject,
                        ARS: sumAmountToProject.ARS += currency.ARS
                      }
                      amounProjects++
                    }
                  }
                })
                setScheduledIngress({ total: sumAmountToProject, amounProjects: amounProjects })
              })
    
            }
          })
          return () => {
            unsubscribe(),
            unsub()
          }
        }
      }, [db, user]);

      const handleOpeners = (open) => {
        let aux = openers
        Object.entries(openers).forEach(([key, value])=>{
            if(key !== open){
              aux = {
                ...aux,
                [key]: false
              }
            } else{
              aux = {
                ...aux,
                [open]: !openers?.[open]
              }
            }
        })
        setOpeners(aux)
      }

      
    return (
        <BalanceContext.Provider value={{balance, scheduledIngress, openers, handleOpeners}}>
            {children}
        </BalanceContext.Provider>
    )
}

const useBalance = () => useContext(BalanceContext)

export {BalanceProvider, useBalance}