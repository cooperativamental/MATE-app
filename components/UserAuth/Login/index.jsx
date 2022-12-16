import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../../context/auth'
import InputSelect from "../../Elements/InputSelect"
import ComponentButton from "../../Elements/ComponentButton"
import Mate_sq from "/public/mate_sq.svg"

const LogIn = () => {
  const router = useRouter()
  const [visiblePass, setVisible] = useState(false)
  const [errors, setErrors] = useState({
    email: false,
    password: false
  })
  const [emailPass, setEmailPass] = useState({
    email: "",
    password: ""
  });
  const { login } = useAuth()

  const logOut = async () => {
    await logout();
  }


  const log = async () => {
    const resLogin = await login({ email: emailPass.email, password: emailPass.password })
    if (resLogin?.error) {
      Object.entries(resLogin?.error).map(([prop, values]) => {
      })
      if (resLogin.error.code === "auth/wrong-password") {
        setErrors({
          password: true
        })
      }
      if (resLogin.error.code === "auth/user-not-found") {
        setErrors({
          email: true
        })
      }
    } else {
      if (router.query.hasOwnProperty("returnUrl")) {
        router.push(router.query.returnUrl)
      } else {
        router.push('/team')
      }
    }
  }
  const emailChange = (e) => {
    setEmailPass({
      ...emailPass,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="fixed flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md overflow-hidden z-50 min-w-max min-h-max gap-4 rounded-xl bg-box-color p-16 shadow-sm shadow-blue-color" >
      <div className='flex flex-col p-2'>
      <Mate_sq className="w-36 p-6" />
      </div>
      <div className="flex flex-col gap-8">
        <div >
          <p className='text-center'>Email address</p>
          <InputSelect
            placeholder='Work Email'
            type="text"
            name="email"
            value={emailPass.email}
            onChange={emailChange}
            inputStyle={` ${errors.email ? "border-red-500" : "border-black"}`}
          />
          {
            errors?.password &&
            <p>Wrong Email</p>
          }
        </div>
        <div>
          <p className='text-center'>Password</p>
          <div className={`flex items-center shadow-md appearance-none border rounded-full w-80 h-20 text-xl ring-1 ${errors.password ? "border-red-500" : "border-black"}`}>
            <InputSelect
              placeholder='Password'
              type={visiblePass ? "text" : "password"}
              name="password"
              value={emailPass.password}
              onChange={emailChange}
              inputStyle={`h-16`}
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
          {
            errors?.password &&
            <p>Wrong Password</p>
          }
        </div>
      </div>
      <button className="bg-transparent text-violet-color" onClick={() => router.push("/resetPass")}>Remember my Password</button>
      <ComponentButton
        buttonEvent={log}
        buttonText="Sign in"
        buttonStyle={`mb-4`}
      />
      <ComponentButton
        buttonEvent={() => {
          router.push("/register")
        }}
        buttonText="Register"
        buttonStyle={`mt-8`}
      />
      
    </div>

  )
}

export default LogIn