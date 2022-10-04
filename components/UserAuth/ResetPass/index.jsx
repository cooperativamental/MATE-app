import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import InputSelect from "../../Elements/InputSelect"
import ComponentButton from "../../Elements/ComponentButton";

const ResetPass = (props) => {
    const [ email, setEmail ] = useState()
    const [ sendMail, setSendMail ] = useState()
    const auth = getAuth();

    const resetPassword = () => {

        sendPasswordResetEmail(auth, email)
        .then(() => {
            console.log("Password reset email sent!") 
            setSendMail(true)
        })
        .catch((error) => {
            console.error(error.message);
        });
    }

    return (
        <div className="flex flex-col h-max w-max gap-8 items-center">
            <label><strong>Ingrese el correo para recuperar contraseña.</strong></label>
            <InputSelect
                type="email"
                onChange={ (e) => setEmail(e.target.value) } 
            />
            <ComponentButton
                buttonEvent={resetPassword}
                buttonText="Restablecer"
            />
            {
                sendMail ?
                <div>
                    <p>Se envio un correo al correo correspondiente.</p> 
                    <p>En caso de no encontrarlo en tu casilla fijarse en la seccion de span</p>
                </div>
                :
                null
            }
        </div>
    )
}

export default ResetPass