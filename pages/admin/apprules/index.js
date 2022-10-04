import Admin from "../../../components/Admin"
import ConfigRules from "../../../components/Admin/ConfigRules";

const PageCreateClient = () => {
    return (
        <Admin>
            <div className="flex w-full justify-center p-4">
                <ConfigRules />
            </div>
        </Admin>
    );
};

export default PageCreateClient;
