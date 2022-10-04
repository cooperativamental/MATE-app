import { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth";
import { push, getDatabase, ref, set } from "firebase/database";

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import InputSelect from "../../Elements/InputSelect"
import ComponentButton from "../../Elements/ComponentButton"

const SignUp = () => {
    const db = getDatabase()
    const { signUp } = useAuth();
    const [visiblePass, setVisible] = useState(false)

    const [user, setUser] = useState({
        userName: "",
        email: "",
        password: "",
        regFis: "",
        // priority: "ADMIN",
        fullName: "",
    });

    const [organization, setOrganization] = useState({
        businessName: "",
        activity: "",
        treasury: "",
    });

    // const groupChange = (e) => {
    //     if (e.target.name === "treasury") {
    //         setGroup({
    //             ...group,
    //             [e.target.name]: Number(e.target.value),
    //         });
    //     } else {
    //         setGroup({
    //             ...group,
    //             [e.target.name]: e.target.value,
    //         });
    //     }
    // };

    const userChange = (e) => {
        if (e.target.name === "organization") {
            setUser({
                ...user,
                organization: e.target.value
            })
        } else {
            setUser({
                ...user,
                [e.target.name]: e.target.value,
            });
        }
    };
    const register = async () => {

        const response = await signUp(
            {
                ...user,
                displayName: user.userName,
            })
        if (response?.error) {
            if (response.error.code === "auth/email-already-exists") {
                alert("Email already exists")
            }
        }
    }

    return (
        <div className="flex flex-col w-10/12 items-center gap-4 pb-4">
            <p className=" text-xl font-medium">Sign Up for independent powers</p>
            <p>Manage collaborative ownership projects</p>
            <InputSelect
                title="Mate Username"
                type="text"
                value={user?.userName}
                name="userName"
                onChange={userChange}
            />
            <InputSelect
                title="Name"
                name="fullName"
                value={user?.fullName}
                onChange={userChange}
            />
            <InputSelect
                title="Work Email"
                type="text"
                name="email"
                value={user?.email}
                onChange={userChange}
            />
            <div className={`flex items-center shadow-md appearance-none border rounded-xl h-min w-full text-xl border-black`}>
                <InputSelect
                    placeholder='Contraseña'
                    type={visiblePass ? "text" : "password"}
                    name="password"
                    onChange={userChange}
                // inputStyle={`h-14`}
                />
                <button
                    onClick={() => setVisible(!visiblePass)}
                    className="h-full px-2"
                >
                    {
                        !visiblePass ?
                            <RemoveRedEyeIcon color="white" />
                            :
                            <VisibilityOffIcon color="white" />
                    }
                </button>
            </div>
            <ComponentButton
                buttonText="Create User"
                buttonEvent={register}
            />
        </div>
    );
}

export default SignUp