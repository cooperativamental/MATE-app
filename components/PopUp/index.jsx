import ComponentButton from "../Elements/ComponentButton"

const PopUp = ({ title, text, buttonEvent, buttonText }) => {

    return (
        <div className="fixed top-0 left-0  z-50 w-screen h-screen">
            <div className="absolute flex flex-col justify-around gap-8 rounded-3xl h-2/5 w-6/12 left-1/2 -translate-x-1/2 translate-y-1/4 bg-[#0f172a] text-white items-center ring-2 ring-white" >
                <h1 className=" text-2xl font-bold">
                    {title}
                </h1>
                <p className=" text-xl font-semibold">
                    {text}
                </p>
                <ComponentButton
                    buttonText={buttonText}
                    buttonEvent={buttonEvent}
                />
            </div>
        </div>
    )
}

export default PopUp