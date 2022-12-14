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
        <div className="flex flex-col w-6/12 items-center gap-4 pb-4 mt-8">
            <p className="text-xl font-medium mb-8 text-center">Register for independent powers to manage collaborative ownership projects.</p>
            <InputSelect
                title="Mate Username"
                type="text"
                value={user?.userName}
                name="userName"
                onChange={userChange}
                inputStyle={`h-16 ring-1 rounded-full text-center caret-slate-100`}
            />
            <InputSelect
                title="Name"
                name="fullName"
                value={user?.fullName}
                onChange={userChange}
                inputStyle={`h-16 ring-1 rounded-full text-center caret-slate-100`}
            />
            <InputSelect
                title="Work Email"
                type="text"
                name="email"
                value={user?.email}
                onChange={userChange}
                inputStyle={`h-16 ring-1 rounded-full text-center caret-slate-100`}
            />
            <div className={`flex items-center shadow-md appearance-none ring-1 rounded-full h-min w-full text-xl`}>
                <InputSelect
                    placeholder='Password'
                    type={visiblePass ? "text" : "password"}
                    name="password"
                    onChange={userChange}
                    inputStyle={`h-16 ring-1 rounded-full text-center caret-slate-100`}
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
                buttonStyle={`mt-10 hover:bg-white hover:text-slate-900`}
            />
        </div>
    );
}

export default SignUp