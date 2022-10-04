import { createContext, useContext, useEffect, useState } from "react";

const HostContext = createContext({
    host: {},
});

const HostProvider = ({ children }) => {
    const [host, setHost] = useState({});

    useEffect(() => {
        setHost(window.location.host)
    }, []);

    return (
        <HostContext.Provider value={{ host }}>
            {children}
        </HostContext.Provider>
    );
};

const useHost = () => useContext(HostContext);

export { HostProvider, useHost };
