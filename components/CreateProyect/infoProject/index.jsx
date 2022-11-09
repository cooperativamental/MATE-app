import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { getDocs, collection, where, query } from "firebase/firestore"
import { useAuth } from "../../../context/auth";
import InputSelect from "../../Elements/InputSelect";
import ComponentButton from "../../Elements/ComponentButton"

const InfoProject = ({ setProject, project, team, confirmInfoProject, confirmation }) => {
  const { user, firestore } = useAuth()
  // const [project, setProject] = useState({
  //   start: "",
  //   end: "",
  //   nameProject: "",
  //   client: ""
  // })
  const [clients, setClients] = useState()
  const [errors, setErrors] = useState({
    nameProject: true,
    client: true,
    start: true,
    end: true
  })
  const [loading, setLoading] = useState(true)
  const refDateStart = useRef()
  const refDateEnd = useRef()
  const router = useRouter()

  useEffect(() => {
    if (user && team) {
      getDocs(query(collection(firestore, "clients"), where("team", "==", team)))
        .then(querySnapshot => {
          let dataClient = null
          querySnapshot.forEach((doc) => {
            dataClient = {
              ...dataClient,
              [doc.id]: doc.data()
            }
          })
          setLoading(false)
          setClients(dataClient)
        })
    }
  }, [firestore, user, team])

  const dateEnd = (propDate) => {
    const newDate = propDate ? new Date(propDate) : new Date();
    if ((new Date(new Date(newDate).getFullYear(), new Date(newDate).getMonth() + 1, 0).getDate() === newDate.getDate())) {
      newDate.setDate(2)
      newDate.setMonth(newDate.getMonth() + 2);
    } else {
      newDate.setDate(newDate.getDate() + 2)
      newDate.setMonth(newDate.getMonth() + 1);
    };
    if (newDate.getMonth() === 0) {
      newDate.setMonth(11)
    }
    const endDate = [
      newDate.getFullYear(),
      newDate.getMonth() === 11 ? "12" : newDate.getMonth() < 10 ? `0${newDate.getMonth()}` : newDate.getMonth(),
      newDate.getDate() < 10 ? `0${newDate.getDate()}` : newDate.getDate(),
    ].join("-");
    return endDate;
  };

  // const validation = (project) => {
  //   let errors = {}
  //   Object.entries(project).map(([key, value]) => {
  //     errors = {
  //       ...errors,
  //       [key]: !value

  //     }
  //   })
  //   return errors
  // }

  const handlerProject = (e) => {
    if (e.target.type === "date") {
      const end = dateEnd(e.target.value);
      if (e.target.name === "start") {
        setProject({
          ...project,
          [e.target.name]: e.target.value,
          end: end,
        });
        return setErrors({
          ...errors,
          [e.target.name]: !e.target.value,
          end: false
        })
      } else {

        setProject({
          ...project,
          end: e.target.name === "end" ? e.target.value : undefined,
        });
      }
    } else if (e.target.name === "client") {
      e.target.value !== 0 &&
        setProject({
          ...project,
          client: {
            [e.target.value]: {
              clientName: clients[e.target.value].clientName,
              // taxes: clients[e.target.value].taxes,
              email: clients[e.target.value].email,
              ...(
                project.fiatOrCrypto === "CRYPTO" &&
                { wallet: clients[e.target.value].wallet }
              )
            }
          },
          // currency: clients[e.target.value].currency
        })
    } else {
      setProject({
        ...project,
        [e.target.name]: e.target.value,
      });
    }
  };

  useEffect(()=>{ 
    let err = {}
    Object.keys(errors).map(prop=> {
      err = {
        ...err,
        [prop]: !project[prop]
      }
    })
    setErrors(err)
  }, [project])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refDateStart.current && !refDateStart.current.contains(event.target)) {
        refDateStart.current.type = "text"
      }
      if (refDateEnd.current && !refDateEnd.current.contains(event.target)) {
        refDateEnd.current.type = "text"
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refDateStart, refDateEnd]);

  const handlerConfirm = () => {
    if (!Object.values(errors).find(error => !!error)) {
      confirmInfoProject("INFO_PROJECT", true, "BUDGET")
    }
  };


  return (
    <div className="pt-2 flex flex-col items-center gap-8 w-8/12">
      <div className="flex flex-col w-full text-center">
        <InputSelect
          conditionError={errors?.nameProject}
          type="text"
          name="nameProject"
          placeholder="Project name"
          value={project?.nameProject}
          onChange={handlerProject}
          subtitle="Up to 100 characters"
          styleSubtitle="text-xs pl-5 text-center"
          inputStyle="text-center"
        />
      </div>

      <div className={`flex flex-col  w-full items-center sm:flex-row sm:gap-8`} >
        <InputSelect
          select
          conditionError={errors?.client}
          name="client"
          onChange={handlerProject}
          defaultValue="Client"
          optionDisabled="Client"
          subtitle="Select the project client"
          styleSubtitle="text-xs pl-5"
        >{
            clients && Object.entries(clients).map(([key, client]) => {
              return <option key={key} value={key}>{`${client.clientName} (${client.wallet})`}</option>
            })
          }
        </InputSelect>

        <ComponentButton
          buttonText="Create Client"
          buttonEvent={() => {
            router.push({
              pathname: "/createclient",
              query: {
                team: team
              }
            },
              "/createclient",
              {
                shallow: true
              }
            )
          }}
          buttonStyle="sm:w-6/12"
        />
      </div>
      <div className={`flex w-full items-center flex-col sm:flex-row gap-8`} >
        <div className="flex flex-col w-full  ">
          <InputSelect
            conditionError={errors?.start}
            name="start"
            placeholder="Starting Date"
            onChange={handlerProject}
            value={ project.start || undefined}
            inputStyle="date relative"
            onMouseOverCapture={() => { refDateStart.current.type = "date" }}
            min={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10
              ? "0" + (new Date().getMonth() + 1)
              : new Date().getMonth() + 1
              }-${new Date().getDate() + 1 < 10
                ? "0" + (new Date().getDate() + 1)
                : new Date().getDate()
              }`}
            forwardedRef={refDateStart}
            subtitle="Project kickoff date"
            styleSubtitle="text-xs pl-5 text-center"

          />
        </div>
        {
          project.start && (
            <div className="flex flex-col w-full">
              <InputSelect
                conditionError={errors?.end}
                inputStyle="date relative"
                name="end"
                placeholder="Closing Date"
                onChange={handlerProject}
                value={project.end}
                min={project.end}
                forwardedRef={refDateEnd}
                onMouseOverCapture={() => { refDateEnd.current.type = "date" }}
                subtitle="Last deadline considering organic delays."
                styleSubtitle="text-xs pl-5 text-center"
              />
            </div>
          )
        }
      </div>

      <div className=" flex w-full flex-col items-center gap-2 mt-6">

        <ComponentButton
          conditionDisabled={Object.values(errors).find(error => !!error)}
          // buttonStyle={`${Object.values(errors).find(error => !!error) ? "bg-gray-400" : ""} font-medium text-xl text-white ring-1 hover:ring-2 ring-slate-400`}
          buttonText="Confirm"
          buttonEvent={handlerConfirm}
        />
        {
          Object.keys(errors).length > 0 &&
          <p className="flex flex-col items-center text-xs justify-center">Fill in all the fields to activate the button</p>
        }
      </div>
    </div >
  );
};

export default InfoProject;


