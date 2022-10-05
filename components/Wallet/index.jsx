import { useRouter } from "next/router";
import { useBalance } from "../../context/contextBalance";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LastMovements from "./LastMovements"
import ComponentButton from "../Elements/ComponentButton"

const Wallet = () => {
  const router = useRouter()
  const { balance, scheduledIngress, handleOpeners } = useBalance()

  return (
    <div className="flex flex-col py-8 h-min w-6/12 text-center items-center gap-4">
      <div className="flex flex-col gap-4 items-center w-full px-4">
        <div className="flex flex-wrap w-10/12 justify-center p-4 rounded-md pt-4 bg-slate-800 dark:ring-1 dark:ring-white/10 dark:ring-inset">
          <div className="flex flex-col min-w-[50%] gap-4 items-center">
            <h2 className="text-3xl font-bold">
              {balance.ARS ? balance.ARS.toLocaleString('es-ar', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }) : "0"}
            </h2>
            <span>USDC</span>
          </div>
          <div className="flex flex-col min-w-[50%] gap-4 items-center">
            <h2 className="text-3xl font-bold">
              {balance.USD ? balance.USD.toLocaleString('es-ar', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }) : "0"}
            </h2>
            <span>US$</span>
          </div>
        </div>
        {
          scheduledIngress.amounProjects ?

            <div className="flex flex-col rounded-md justify-between items-center gap-4 p-4 my-8 w-8/12 md:flex-row">
              <div className="flex flex-col w-[calc(50%_-_1rem)] justify-center items-center gap-2">
                <h4>Expected Revenues</h4>
                {
                  !!scheduledIngress.total.ARS &&
                  <p className="text-xl font-bold">{scheduledIngress.total.ARS.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 })}</p>
                }
                {
                  !!scheduledIngress.total.USD &&
                  <p className="text-xl font-bold">{scheduledIngress.total.USD.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 })}</p>
                }
              </div>
              <ArrowDropDownIcon className="md:-rotate-90 w-4" />
              {
                scheduledIngress.amounProjects &&
                <div className="flex flex-col w-[calc(50%_-_1rem)] items-center">
                  <p className=" text-4xl font-semibold"> {scheduledIngress.amounProjects}</p>
                  <span>Projects</span>
                </div>
              }
            </div>
            :
            null
        }
        <div className="flex flex-col items-center mb-12">
          {/* <ComponentButton
            buttonStyle={"bg-cyan-800 h-12 p-2 m-4 text-white text-2xl font-semibold hover:bg-cyan-700"}
            buttonText="Withdraw"
            buttonEvent={() => {
              handleOpeners("withdraw")
            }}
          /> */}
          {/* <ComponentButton
            buttonStyle={"h-12 p-2 bg-purple-600 m-4 rounded-lg text-white text-2xl font-semibold hover:bg-purple-500"}
            buttonText="SWAP"
            buttonEvent={() => { handleOpeners("currencyConversion") }}
          /> */}

          <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-center ">
            <ComponentButton
              buttonStyle="rounded-lg md:rounded-none h-12 w-min px-4 md:pl-4 md:pr-8 bg-slate-600 text-white text-2xl font-normal md:rounded-l-lg text-center hover:bg-slate-500"
              buttonText="Movements"
              buttonEvent={() => router.push("wallet/movements")}
            />
            <ComponentButton
              buttonStyle="rounded-lg md:rounded-none h-12 w-min px-4 md:pl-8 md:pr-4 text-white bg-slate-800 text-white text-2xl font-normal md:rounded-r-lg text-center hover:bg-slate-700"
              buttonText="Projects"
              buttonEvent={() => router.push("projects")}
            />
          </div>
        </div>
      </div>
      <LastMovements />
    </div>

  );
}

export default Wallet