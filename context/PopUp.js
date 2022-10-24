import { createContext, useContext, useEffect, useState } from "react";
import ComponentButton from "../components/Elements/ComponentButton"

const PopUpContext = createContext({
    config: {
        title: "",
        text: "",
        onClick: null
    },
    handlePopUp: (config) => { }
});

const PopUpProvider = ({ children }) => {
    const [open, setOpen] = useState(false)
    const [popUp, setPopUp] = useState({
        title: "",
        text: "",
        onClick: null,
    });

    // useEffect(() => {
    //     setTimeout(() => {
    //         setPopUp({
    //             ...popUp,
    //             status: false
    //         })
    //     }, 4000);
    // }, []);

    const handlePopUp = (config) => {
        setOpen(true)
        setPopUp(config)
    }

    return (
        <PopUpContext.Provider value={{ popUp, handlePopUp }}>
            {
                open &&
                <div className="fixed top-0 left-0  z-50 w-screen h-screen">
                    <div className="absolute flex flex-col justify-around  rounded-3xl h-2/5 w-6/12 left-1/2 -translate-x-1/2 translate-y-1/4 bg-[#0f172a] text-white items-center ring-2 ring-white" >
                        <h1 className=" text-2xl font-bold">
                            {popUp.title}
                        </h1>
                        <div className="flex w-8/12 font-semibold text-xl overflow-hidden text-clip">
                            {popUp.text}
                        </div>
                        <ComponentButton
                            buttonText="Close"
                            buttonEvent={() => popUp?.onClick ? popUp.onClick() : setOpen(false) }
                            buttonStyle="w-min"
                        />

                    </div>
                </div>
            }
            {children}
        </PopUpContext.Provider>
    );
};

const usePopUp = () => useContext(PopUpContext);

export { PopUpProvider, usePopUp };
