import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { getDatabase, ref, set, get, push } from "firebase/database";
import { addDoc, collection } from "firebase/firestore"
import { useAuth } from "../../context/auth"

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../../hooks/useProgram/index.ts"

import InputSelect from "../Elements/InputSelect"
import ComponentButton from "../Elements/ComponentButton"


const CreateClient = () => {
  const router = useRouter()
  const db = getDatabase()
  const { firestore } = useAuth()
  const [clientReg, setClient] = useState({
    clientName: "",
    businessName: "",
    wallet: "",
    // currency: "",
    email: "", 
    taxes: false
  });

  const { connection } = useConnection()
  const wallet = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });


  // useEffect(() => {
  //   if(program?.account?.group){
  //     (async()=>{
  //       const resOrganizationsWeb3 = await program?.account?.group.all()
  //       const forEntries = resOrganizationsWeb3.map((organization)=> {
  //         return [
  //           organization.publicKey.toBase58(),
  //           {
  //             ...organization.account
  //           }
  //         ]
  //       })

  //       const objOrganizations = Object.fromEntries(forEntries)
  //       setOrganization(objOrganizations)
  //     })()
  //   }
  // }, [program?.account?.group])

  const clientChange = (e) => {
    if(e.target.name === "taxes"){
      setClient({
        ...clientReg,
        [e.target.name]: Number(e.target.value) * 100,
      });
    } else {
      setClient({
        ...clientReg,
        [e.target.name]: e.target.value,
      });
    }
  };

  const createClient = async () => {

    await addDoc(collection(firestore, "clients"), {
      ...clientReg,
      organizations: router.query.organization
    });

    const clientRef = ref(db, "clients");
    const pushClient = push(clientRef);
    set(pushClient, {
      ...clientReg,
      taxes: clientReg.taxes
    })
      .then((res) => {
        alert("success")
      })
      .catch((error) => {
        // The write failed...
        console.error(error)
      });
  }

  return (
    <div className="flex flex-col w-10/12 gap-4 items-center py-4">
      <h1 className="text-2xl font-bold">Crear Cliente</h1>
      <p>Introduzca los datos para poder crear el cliente.</p>
      <div className="flex w-full justify-between text-2xl font-medium">
        <p>Organization:</p>
        <p>{router?.query?.organization}</p>
      </div>
      <InputSelect
        placeholder="Nombre de Cliente"
        type="text"
        value={clientReg.clientName}
        name="clientName"
        onChange={clientChange}
      />
      {/* <InputSelect
        placeholder="Razon Social"
        type="text"
        name="businessName"
        value={clientReg.businessName}
        onChange={clientChange}
      /> */}
      <InputSelect
        placeholder="wallet"
        type="text"
        name="wallet"
        value={clientReg.wallet}
        onChange={clientChange}
      />
      {/* <InputSelect
        id="taxes"
        styleTitle="self-start"
        title="Impuestos sobre facturación"
        type="number"
        name="taxes"
        placeholder="Impuestos sobre facturación"
        onChange={clientChange}
      /> */}
      {/* <InputSelect
        select
        name="currency"
        optionDisabled="Moneda"
        onChange={clientChange}
      >
        <option>USD</option>
        <option>ARS</option>
      </InputSelect> */}
      <InputSelect
        placeholder="Email para envio de facturas."
        type="email"
        name="email"
        value={clientReg.email}
        onChange={clientChange}
      />
      <ComponentButton
        buttonEvent={createClient}
        buttonText="Crear Cliente"
      />
    </div>
  );
}

export default CreateClient