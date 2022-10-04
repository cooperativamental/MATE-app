import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Withdrawals from "../../../components/Wallet/Withdrawals";
import Income from "../../../components/Wallet/Income";
import InvoiceDiscount from "../../../components/Wallet/InvoiceDiscount";
import CurrencyConversion from "../../../components/Wallet/CurrencyConversion";
import ComponentButton from "../../../components/Elements/ComponentButton"

const PageHomeMovements = () => {
  const [list, setList] = useState("INCOME");
  const router = useRouter()

  useEffect(() => {
    if (router?.query?.type) {
      setList(router?.query?.type)
    }
  }, [router?.query?.type])

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex gap-4">
        <ComponentButton
          buttonStyle={`h-min ${list === "INCOME" ? "bg-secondary-color" : "bg-gray-400"}`}
          buttonEvent={() => setList("INCOME")}
          buttonText="Ingresos"
        />
        <ComponentButton
          buttonStyle={`h-min ${list === "WITHDRAWALS" ? "bg-secondary-color" : "bg-gray-400"}`}
          buttonEvent={() => setList("WITHDRAWALS")}
          buttonText="Retiros"
        />
        <ComponentButton
          buttonStyle={`h-min ${list === "INVOICE_DISCOUNT" ? "bg-secondary-color" : "bg-gray-400"}`}
          buttonEvent={() => setList("INVOICE_DISCOUNT")}
          buttonText="Facturas de terceros"
        />
        <ComponentButton
          buttonStyle={`h-min ${list === "CURRENCY_CONVERSION" ? "bg-secondary-color" : "bg-gray-400"}`}
          buttonEvent={() => setList("CURRENCY_CONVERSION")}
          buttonText="Cambio de divisa"
        />
      </div>
      {
        list === "INCOME" &&
        <Income />
      }
      {
        list === "WITHDRAWALS" &&
        <Withdrawals />
      }
      {
        list === "INVOICE_DISCOUNT" &&
        <InvoiceDiscount />
      }
      {
        list === "CURRENCY_CONVERSION" &&
        <CurrencyConversion />
      }
    </div>
  );
};

export default PageHomeMovements;