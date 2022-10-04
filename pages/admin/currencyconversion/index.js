import ListCurrencyConversion from "../../../components/Admin/CurrencyConversion";
import Admin from "../../../components/Admin"
import styles from "./adminCurrencyConversion.module.scss";

const Administration = () => {
    return (
        <Admin>
            <div className="flex justify-evenly w-full h-[calc(100%_-_3rem)] mt-4 px-4">
                <ListCurrencyConversion />
            </div>
        </Admin>
    );
};

export default Administration;
