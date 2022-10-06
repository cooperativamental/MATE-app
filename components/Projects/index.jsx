import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

import { useAuth } from "../../context/auth";
import { getDatabase } from "firebase/database";

const Projects = ({ projects, fnProjects, queryId }) => {
  const router = useRouter();
  const [selected, setSelected] = useState(queryId ? queryId : false);
  const [listProject, setListProjects] = useState([])
  const [sorting, setSorting] = useState(undefined)
  const refProject = useRef()

  useEffect(() => {
    setListProjects(projects)
  }, [projects])

  const selectProject = ({ id, project }) => {
    fnProjects(project),
      setSelected(id)
  };


  const sort = (e) => {
    if (sorting === e.target.id) {
      const newList = [...listProject].reverse()
      setListProjects(newList)
    } else {
      setSorting(e.target.id)
      setListProjects(listProject.sort((a, b) => {

        const alow = a[e.target.id] && a[e.target.id].toLowerCase()
        const blow = b[e.target.id] && b[e.target.id].toLowerCase()
        if (!alow && blow) {
          return -1
        }
        if (alow > blow) {
          return 1;
        }
        if (alow < blow) {
          return -1
        }
        return 0
      }
      ))
    }
  }


  return (
    <table className="w-full text-center table-fixed border-slate-200">
      <thead>
        <tr className='h-12'>
          <th className='border border-slate-500 bg-slate-800 cursor-pointer'><div id="invoiceDate" onClick={(e) => sort(e)}>Incoming payment</div></th>
          <th className='border border-slate-500 bg-slate-800 cursor-pointer'><div id="nameProject" onClick={(e) => sort(e)}>Project Name / Client</div></th>
          {
            router.pathname !== "/wallet" &&
            <th className='border border-slate-500 bg-slate-800 cursor-pointer'><div id="status" onClick={(e) => sort(e)}>Status</div></th>
          }
        </tr>
      </thead>
      <tbody className="font-normal">
        {
          listProject && listProject?.map((project) => {
            return (
              <tr
                key={project?.id}
                onClick={() => {
                  selectProject({ id: project?.id, project: project });
                }}
                className={`
                  h-12 max-h-12 hover:bg-slate-800 cursor-pointer
                  ${selected === project?.id ? " bg-[#F2EBFE] text-[#5A31E1]" : ""}
                `}
                ref={refProject}
              >
                <td className='border-y-2 border-slate-600'>{project?.invoiceDate || "Not confirmed"}</td>
                <td className='border-y-2 border-slate-600'>
                  <div>
                    <p>
                      {project?.nameProject}
                    </p>
                    <p className={`${selected === project?.id ? " text-[#cca9fd]" : " text-slate-100"}`}>
                      {project?.client && Object.values(project?.client).map(client => client.clientName)}
                    </p>
                  </div>
                </td>
                {
                  router.pathname !== "/wallet" &&
                  <td className='border-y-2 border-slate-600'>
                    {
                      project?.status?.toLowerCase() === "INVOICE_CALL".toLowerCase() ?
                        "Call for invoicing" :
                        project?.status?.toLowerCase() === "INVOICE_ORDER".toLowerCase() ?
                          "Invoiced" :
                          project?.status?.toLowerCase() === "INVOICE_PENDING".toLowerCase() ?
                            "Pending Invoicing" :
                            project?.status?.toLowerCase()
                    }
                  </td>
                }
              </tr>
            );
          })
        }
      </tbody>
    </table>
  );
};

export default Projects;
