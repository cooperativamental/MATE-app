import GeneralBalance from "../../../components/Admin/GeneralBalance";
import UsersBalance from "../../../components/Admin/UsersBalance";

import Admin from "../../../components/Admin"

const PageGeneralBalance = () => {
    return (
        <Admin>
            <div className="flex flex-col items-center w-full ">
                <GeneralBalance />
                <hr className=" h-[3px] bg-slate-300 border-[1px] w-11/12  " />
                <UsersBalance />
            </div>
        </Admin>
    );
};

export default PageGeneralBalance;
