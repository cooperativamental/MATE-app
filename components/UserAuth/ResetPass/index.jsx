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
            <label><strong>Enter your registered email</strong></label>
            <InputSelect
                type="email"
                onChange={ (e) => setEmail(e.target.value) } 
                inputStyle="w-80 text-center text-2xl text-white caret-slate-100"
            />
            <ComponentButton
                buttonEvent={resetPassword}
                buttonText="Reset"
            />
            {
                sendMail ?
                <div>
                    <p>Password reset email sent!</p> 
                    <p>Just in case check the spam inbox.</p>
                </div>
                :
                null
            }
        </div>
    )
}

export default ResetPass