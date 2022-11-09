import { useState, useEffect } from "react";

import { useRouter } from "next/router";

import { getAuth, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { update, ref, getDatabase } from "firebase/database";
import { useAuth } from "../../../context/auth";
import InputSelect from "../../Elements/InputSelect";

import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';


import styles from "./updateuser.module.scss"
import ComponentButton from "../../Elements/ComponentButton";
import { usePopUp } from "../../../context/PopUp";

const UpdateUser = (props) => {
    // const [email, setEmail] = useState()
    const db = getDatabase()
    const auth = getAuth();
    const { user } = useAuth()
    const router = useRouter()
    const { handlePopUp } = usePopUp()
    const [stateUser, setStateUser] = useState()
    const [visiblePass, setVisible] = useState()
    const [error, setError] = useState({
        password: false
    })
    useEffect(() => {
        setStateUser(user)
    }, [user])



    const handleUser = (e) => {
        setStateUser({
            ...stateUser,
            [e.target.name]: e.target.value,
        })
    }

    const confirmHandleUser = async () => {
        if (stateUser.displayName && stateUser.name) {
            await updateProfile(auth.currentUser, { displayName: stateUser.displayName })
            await update(ref(db, `users/${stateUser.uid}`), {
                name: stateUser.displayName,
                name: stateUser.name
            })
        }
        router.reload()
    }

    const resetPassword = (e) => {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, stateUser.password)
        reauthenticateWithCredential(auth.currentUser, credential).then(res => {
            setError({ password: false })
            updatePassword(auth.currentUser, stateUser.newPassword).then(() => {
                handlePopUp({
                    text: "Successful update",
                    title: `Update User`,
                  })
            }).catch((error) => {
                handlePopUp({
                    text: "the change could not be made",
                    title: `Update User`,
                  })
            });
        })
            .catch(error => {
                setError({ password: true })
                handlePopUp({
                    text: "The current password does not match the one registered",
                    title: `Update User`,
                  })
            })
    }

    if (stateUser) {
        return (
            <div className="flex flex-col items-center h-min w-8/12 gap-4">
                <div className="w-full">
                    <label htmlFor="displayName">Nombre de Usuario</label>
                    <InputSelect
                        inputStyle="border-2 shadow-sm rounded-xl w-full h-16 text-xl p-2"
                        type="text"
                        name="displayName"
                        placeholder="Nombre de Usuario"
                        value={stateUser?.displayName}
                        onChange={handleUser}
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="name">Nombre Completo</label>
                    <InputSelect
                        inputStyle="border-2 shadow-sm rounded-xl w-full h-16 text-xl p-2"
                        type="text"
                        name="name"
                        placeholder="Nombre Completo"
                        value={stateUser?.name}
                        onChange={handleUser}
                    />
                </div>
                <button onClick={confirmHandleUser}>Modificar datos de usuario</button>

                <div
                    className={`flex justify-between bg-transparent border-2 shadow-sm rounded-xl w-full text-xl ${error?.password ? "border-red" : null}`}
                >
                    <InputSelect
                        inputStyle="h-16 bg-transparent"
                        placeholder='Contraseña actual'
                        type={visiblePass ? "text" : "password"}
                        name="password"
                        onChange={handleUser}
                    />
                    <button
                        onClick={() =>
                            setVisible(!visiblePass)
                        }
                    >
                        {
                            !visiblePass ? <RemoveRedEyeIcon color="disabled" /> : <VisibilityOffIcon color="disabled" />
                        }
                    </button>
                </div>
                <div
                    className="flex justify-between bg-transparent border-2 shadow-sm rounded-xl w-full text-xl"
                >
                    <InputSelect
                        inputStyle="h-16 bg-transparent"
                        placeholder='Contraseña'
                        type={visiblePass ? "text" : "password"}
                        name="newPassword"
                        onChange={handleUser}
                    />
                    <button
                        onClick={() =>
                            setVisible(!visiblePass)}
                    >
                        {
                            !visiblePass ? <RemoveRedEyeIcon color="disabled" /> : <VisibilityOffIcon color="disabled" />
                        }
                    </button>
                </div>
                <ComponentButton
                    buttonText="Cambiar Contraseña"
                    buttonEvent={resetPassword}
                />
            </div>
        )
    } else {
        return(
        <div className=" flex  flex-col items-center justify-center w-11/12 h-96 mt-4 ">
            <div className="animate-spin border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
        </div>
        )
    }
    
}

export default UpdateUser