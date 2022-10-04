import ListTransferences from "../../../components/Admin/Transferences";
import Admin from "../../../components/Admin"
import styles from "./adminTransferences.module.scss";

const AdminTransferences = () => {
    return (
        <Admin>
            <div className="flex justify-evenly w-full h-[calc(100%_-_3rem)] mt-4 px-4">
                <ListTransferences />
            </div>
        </Admin>
    );
};

export default AdminTransferences;
