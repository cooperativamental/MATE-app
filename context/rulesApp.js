import { get, getDatabase, onValue, ref } from "firebase/database";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth";

const RulesContext = createContext({
    rules: {
        currency: {}
    }
})

const RulesProvider = ({children}) => {
    const db = getDatabase()
    const { user } = useAuth()
    const [rules, setRules] = useState({
        currency: {}
    })

    useEffect(() => {
        if (user) {
            const unsubscribe = onValue(ref(db, `rules`),
                data => {
                    if(data.hasChildren()){
                        setRules(data.val())
                    }
                }
            )
            return () =>
                unsubscribe()

        }
    }, [db, user])

    return (
        <RulesContext.Provider value={{ rules }}>
            {children}
        </RulesContext.Provider>
    )
}

const useRules = () => useContext(RulesContext);

export { useRules, RulesProvider }