import { useRouter } from "next/router";
import ComponentButton from "../Elements/ComponentButton"
import ScrollButtons from "../Elements/Scroll";

const Administration = ({ children, }) => {
  const router = useRouter()

  return (
    <div className="flex flex-col w-full ">
      <ScrollButtons>
        {
          [
            <ComponentButton
              key="Balance General"
              buttonStyle="whitespace-nowrap w-max h-min bg-tertiary-color"
              buttonText="Balance General"
              buttonEvent={() => router.push("/admin/generalbalance")}
            />,
            <ComponentButton
              key="Proyectos"
              buttonStyle="whitespace-nowrap w-max h-min bg-secondary-color"
              buttonText="Proyectos"
              buttonEvent={() => router.push("/admin/project")}
            />,
            <ComponentButton
              key="Crear Cliente"
              buttonStyle="whitespace-nowrap w-max h-min bg-primary-color"
              buttonText="Crear Cliente"
              buttonEvent={() => router.push("/admin/createclient")}
            />,
            <ComponentButton
              key="Cambio de Moneda"
              buttonStyle="whitespace-nowrap w-max h-min bg-[#1b63d6]"
              buttonText="Cambio de Moneda"
              buttonEvent={() => router.push("/admin/currencyconversion")}
            />,
            <ComponentButton
              key="Transferencias"
              buttonStyle="whitespace-nowrap w-max h-min bg-tertiary-color"
              buttonText="Transferencias"
              buttonEvent={() => router.push("/admin/transferences")}
            />,
            <ComponentButton
              key="Crear Usuario"
              buttonStyle="whitespace-nowrap w-max h-min bg-primary-color"
              buttonText="Crear Usuario"
              buttonEvent={() => router.push("/admin/createuser")}
            />,
            <ComponentButton
              key="Configuración Reglas"
              buttonStyle="whitespace-nowrap w-max h-min bg-secondary-color"
              buttonText="Reglas App"
              buttonEvent={() => router.push("/admin/apprules")}
            />,
            <ComponentButton
              key="Crear Grupo"
              buttonStyle="whitespace-nowrap w-max h-min bg-secondary-color"
              buttonText="Crear Grupo"
              buttonEvent={() => router.push("/admin/createorganization")}
            />
          ]
        }
      </ScrollButtons>
      {
        children
      }
    </div>
  );
};

export default Administration;
