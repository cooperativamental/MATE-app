import { useRouter } from "next/router"

const ComponentButton
    = ({ btn2, btn3, buttonText, buttonEvent, buttonStyle, conditionDisabled, isBack, routeBack }) => {
        if (isBack) {
            return(
                <div
                    onClick={routeBack || buttonEvent}
                    className={`${buttonStyle || ""} btn-back`}
                >
                    <button className="h-3 w-3 border-t-2 border-l-2 border-white -rotate-45" />
                </div>
            )
        } else {
            return (
                <button className=
                    {` ${btn2 && "btn2"} ${btn3 && "btn3"} ${(!btn2 && !btn2) && "btn" } ${buttonStyle || ""} ${conditionDisabled && "!bg-none !bg-slate-500 hover:!bg-slate-300 hover:!text-slate-500" }  w-full rounded-full hover:text-white`}
                    onClick={buttonEvent}
                    disabled={conditionDisabled ? "disabled" : undefined}
                >
                    {buttonText}
                </button>
            );
        }
    }

export default ComponentButton
    ;