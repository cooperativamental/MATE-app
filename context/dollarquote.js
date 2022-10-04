import { createContext, useContext, useEffect, useState } from "react";

const DollarQuoteContext = createContext({
    dolarquote: {},
});

const DollarProvider = ({ children }) => {
    const [dollarQuote, setDollarQuote] = useState({});

    useEffect(() => {
        fetch("/api/dollarquote")
        .then(resp=>{
            resp.json()
            .then(data=>{
                setDollarQuote(data)
            })
        })
        .catch(err=>
            console.log("error",err)
        )
    }, []);

    return (
        <DollarQuoteContext.Provider value={{ dollarQuote }}>
            {children}
        </DollarQuoteContext.Provider>
    );
};

const useDollarQuote = () => useContext(DollarQuoteContext);

export { DollarProvider, useDollarQuote };
