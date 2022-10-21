import { useState, useEffect } from "react";
import { useAuth } from "../../../context/auth";

import { get, getDatabase, ref, set } from "firebase/database";

import styles from "./singup.module.scss";


const CreateUser = () => {
  const db = getDatabase()
  const { signup } = useAuth();
  const [errors, setErrors] = useState()
  const [user, setUser] = useState({
    userName: "",
    email: "",
    password: "MentalWallet",
    regFis: "",
    priority: "USER",
    fullName: "",
    team: []
  });
  const [teams, setTeams] = useState()

  useEffect(() => {
    const getter = async () => {
      const res = await get(ref(db, `/teams`))
      if (res.hasChildren()) {
        const teams = res.val()
        setTeams(teams)
      }
    }
    getter()
  }, [])

  const userChange = (e) => {
    if (e.target.name === "team") {

      setUser({
        ...user,
        team: [e.target.value]
      })
    } else {
      setUser({
        ...user,
        [e.target.name]: e.target.value,
      });
    }
  };
  const register = async () => {
    const response = await signup(
      {
        ...user,
        displayName: user.userName,
      })
      if(response?.error){
        if(response.error.code === "auth/email-already-exists"){
          alert("El mail ya esta en uso. No pueden haber usuarios con el mismo mail.")
        }
      }
  }

  return (
    <div className="flex flex-col w-10/12 items-center gap-4 pb-4">
      <p className=" text-xl font-medium">Registre el usuario deseado</p>
      <p>Introduzca los datos para poder registrar el usuario.</p>
      <label className="flex w-full font-medium  " htmlFor="userName">Nombre de Usuario</label>
      <input className={` flex w-full border rounded-xl h-16 p-4 text-black text-xl shadow-sm `} type="text" value={user?.userName} name="userName" onChange={userChange} />
      <label className="flex w-full font-medium" htmlFor="fullName">Nombre completo</label>
      <input className={` flex w-full border text-black rounded-xl h-16 p-4 text-xl shadow-sm `} name="fullName" value={user?.fullName} onChange={userChange} />
      <label className="flex w-full font-medium" htmlFor="email">Email</label>
      <input className={` flex w-full border text-black rounded-xl h-16 p-4 text-xl shadow-sm`} type="text" name="email" value={user?.email} onChange={userChange} />
      <label className="flex w-full font-medium" htmlFor="regFis">Regimen Fiscal</label>
      <select
        className={` flex w-full border text-black rounded-xl h-16 p-4 text-xl shadow-sm`}
        type="text"
        name="regFis"
        defaultValue={0}
        onChange={userChange}
      >
        <option value={0} disabled></option>
        <option value="MONOTRIBUTO">Monotributo</option>
        <option value="AUTONOMO">Autonomo</option>
        <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto</option>
      </select>
        {
          teams &&
          <select
            defaultValue={0}
            onChange={userChange}
            name="team"
            className={`text-black flex w-full border rounded-xl h-16 p-4 text-xl shadow-sm`}
          >
            <option value={0} disabled>Seleccionar Grupo</option>
            {
              Object.entries(teams).map(([key, team]) => {
                return (
                  <option key={key} value={key}>{team.businessName}</option>
                )
              })
            }
          </select>
        }
        <button className="flex h-12 bg-[#5A31E1] rounded-xl text-3xl text-white font-medium items-center p-6 " onClick={register}>
          Crear Usuario
        </button>
    </div>
  );
}

export default CreateUser