import CurrencyConversionID from "../../../components/Admin/CurrencyConversion/CurrencyConversionID";
import Admin from "../../../components/Admin"
import styles from "./adminCurrencyConversion.module.scss";

const AdminTransferencesID = () => {
    return (
        <Admin>
            <div className="flex justify-evenly w-full h-[calc(100%_-_3rem)] overflow-y-auto scrollbar mt-4 px-4">
                <CurrencyConversionID />
            </div>
        </Admin>
    );
};

export default AdminTransferencesID;
