import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "../../context/auth";
import {
  getDatabase,
  ref,
  query,
  onValue,
  orderByValue,
  update
} from "firebase/database";

// import { InvoiceOrder } from "./Invoicing/InvoiceOrder";
// import { InvoiceCall } from "./Invoicing/InvoiceCall"
// import { BillCollected } from "./Invoicing/BillCollected";

import Projects from "../Projects";
import SalarySettlement from "./SalarySettlement";
import ConfirmProject from "./ConfirmProject";
import Revision from "./Revision"
import ProjectSheets from "./ProjectSheets"
import { CollectPending } from "./CollectCrypto/CollectPending";
import { CollectCall } from "./CollectCrypto/CollectCall";
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"


const AdminProjects = ({ prj }) => {
  const db = getDatabase();
  const router = useRouter()
  const { user } = useAuth();
  const [keyProject, setKeyProject] = useState(null);
  const [project, setProject] = useState()
  const [projects, setProjects] = useState([]);
  const [isHolder, setIsHolder] = useState(false)
  const [loading, setLoading] = useState(true)


  const { connection } = useConnection()

  const render = (status) => {

    const objRender = {
      announcement:
        <ConfirmProject
          keyProject={keyProject}
          project={project}
        />,
      revision_partner:
        <Revision
          keyProject={keyProject}
          project={project}
        />,
      invoice_pending:
        <CollectPending
          project={project}
          keyProject={keyProject}
        />,
      awaiting_payment:
        <ProjectSheets
          keyProject={keyProject}
          project={project}
        />
      ,
      bill_collected:
        <SalarySettlement
          keyProject={keyProject}
          project={project}
        />,
      distributed:
        <CollectCall
          keyProject={keyProject}
          project={project}
        />,
      payed:
        <ProjectSheets
          keyProject={keyProject}
          project={project}
        />
    }
    const proxy = new Proxy(objRender, {
      get: (target, prop) => {
        if (prop in target) {
          return target[prop]
        } else {
          return (
            <ProjectSheets
              keyProject={keyProject}
              project={project}
            />
          )
        }
      }
    })

    return proxy[status]
  }

  useEffect(() => {
    if (user) {
      console.log(router)
      if (router.query.id) {
        setKeyProject(router.query.id)
      }
      const unsubscribe = onValue(
        query(ref(db, `users/${user.uid}/projectsOwner`), orderByValue("createdAt"))
        , (res) => {
          const unsub = onValue(ref(db, "projects/"),
            resPrj => {
              if (res.hasChildren()) {
                let stateProjects = []
                Object.entries(resPrj.val()).map(([key, value]) => {
                  Object.keys(res.val()).map(keyPrjOwn => {
                    if (keyPrjOwn === key) {
                      let localeDate = ""
                      if (value.invoiceDate) {
                        localeDate = new Date(value.invoiceDate).toLocaleDateString()
                      } else {
                        localeDate = value.invoiceDate
                      }
                      stateProjects =
                        [
                          ...stateProjects,
                          {
                            ...value,
                            id: key,
                            invoiceDate: localeDate
                          }
                        ]
                    }
                  })
                })
                setProjects(stateProjects.reverse())
                setLoading(false)
              } else {
                setLoading(false)
                setProjects(false)
              }
            })
          return () => unsub()
        }
      );
      return () => {
        unsubscribe()
        // }
      }
    }
  }, [user]);

  useEffect(() => {
    if (keyProject && user) {
      console.log(keyProject)
      const unsubscribe = onValue(ref(db, `projects/${keyProject}`), res => {
        if (res.hasChildren()) {
          setProject(res.val())
        }
      })
      return () => {
        unsubscribe()

      }
    }
  }, [db, user, keyProject])

  const handleInfoProject = async (propProject) => {
    router.push({
      pathname: `${router.pathname}/[id]`,
      query: {
        id: propProject.id
      }
    },
      `/${router.pathname}`,
      {
        shallow: true
      }
    );
  }

  console.log(project)

  if (loading) {
    return (
      <div className=" flex  flex-col items-center justify-center w-11/12 h-96  ">
        <div className="animate-spin border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
      </div>
    )
  } else {
    return (
      render(project?.status?.toLowerCase())
    )
  }
};

export default AdminProjects;
