import { useState, useEffect } from "react"
import { getDatabase, onValue, ref, update } from "firebase/database"
import { useAuth } from "../../../context/auth"
import InputSelect from "../../Elements/InputSelect"
import ComponentButton from "../../Elements/ComponentButton"

const ConfigRules = () => {
    const db = getDatabase()
    const {user} = useAuth()
    const [ rules, setRules ] = useState()

    useEffect(()=>{
        if(user){
            const unsubscribe = onValue(ref(db, `rules`), 
                (data) => {
                    setRules(data.val())
                }
            )
            return () => unsubscribe()
        }
    },[])
    
    const handlerRules = (e) => {
        const options = e.target.options;
        let values = rules;

        for (let i = 0; options.length > i; i++) {
          if (options[i].selected) {
            values = {
                ...values,
                currency:{
                    ...values.currency,
                    [options[i].value]: true
                }
            }
          } else {
            values = {
                ...values,
                currency:{
                    ...values.currency,
                    [options[i].value]: false
                }
            }
          }
        }
        setRules({
            ...values
        })
    }

    const confirmSetRules = () => {
        const refRules = ref(db, `rules`);
        update(refRules, 
            rules
        )
            .then(res=>{
                alert()
            })
    }
    return (
        <div className="flex flex-col items-center gap-8 w-8/12">
            <InputSelect
                title={"Seleccione los tipos de cambio habilitados para la venta:"}
                subtitle="*puede seleccionar varias opciones."
                select
                multiple
                inputStyle="scrollbar h-15"
                onChange={handlerRules}
            >
                <option selected={rules?.currency?.USD} >USD</option>
                <option selected={rules?.currency?.ARS}>ARS</option>
            </InputSelect>
            <div className="flex flex-col items-center gap-4">
                <p>Confirmar reglas para asignar a la aplicación.</p>
                <ComponentButton
                    buttonEvent={confirmSetRules}
                    buttonText="Confirmar Reglas"
                />
            </div>
        </div>
    )
}

export default ConfigRules 