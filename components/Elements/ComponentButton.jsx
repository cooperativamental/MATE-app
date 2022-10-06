import { useRouter } from "next/router"

const ComponentButton
    = ({ buttonText, buttonEvent, buttonStyle, conditionDisabled, isBack, routeBack }) => {
        const router = useRouter()
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
                    {`${buttonStyle || ""} ${conditionDisabled && "bg-gray-500"} btn w-full rounded-full active:ring-4`}
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