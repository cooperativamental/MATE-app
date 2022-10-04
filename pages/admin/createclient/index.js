import CreateClient from "../../../components/Admin/CreateClient";
import Admin from "../../../components/Admin"
import styles from "./adminCreateClient.module.scss";

const PageCreateClient = () => {
    return (
        <Admin>
            <div className="flex w-full justify-center p-4">
                <CreateClient />
            </div>
        </Admin>
    );
};

export default PageCreateClient;
