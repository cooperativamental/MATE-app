import CreateUser from "../../../components/UserAuth/CreateUser";
import Administration from "../../../components/Admin"

const PageSignUp = () => {
    return (
        <Administration>
            <div className="flex w-full justify-center p-4">
                <CreateUser />
            </div>
        </Administration>
    );

}

export default PageSignUp