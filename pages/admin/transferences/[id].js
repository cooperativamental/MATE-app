import TransferenceID from "../../../components/Admin/Transferences/TransferenceID";
import Admin from "../../../components/Admin"
import styles from "./adminTransferences.module.scss";

const AdminTransferencesID = () => {
    return (
        <Admin>
            <div className="flex justify-evenly w-full h-[calc(100%_-_3rem)] mt-4 px-4">
                <TransferenceID />
            </div>
        </Admin>
    );
};

export default AdminTransferencesID;
