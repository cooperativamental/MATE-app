import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Projects from "../../components/Projects";

import { getDatabase, onValue, orderByValue, ref, query, get } from "firebase/database";
import { useAuth } from "../../context/auth";

import HeadBar from "../../components/Elements/HeadTab" 

const PageHomeProjects = () => {
  const router = useRouter();
  const db = getDatabase();
  const [showProject, setShowProject] = useState(
    (()=>{
      let showPrj = ""
      if(router.query.holder){
        router.query.holder === "true" ?
        showPrj = "HOSTING"
        : 
        showPrj = "INVITED"
      } else {
        showPrj = "HOSTING"
      }
      return showPrj
    })()
  )
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([]);
  const [tabs, setTabs] = useState([
    { name: 'Hosting', current: router.query.holder ? router.query.holder === "true" : true , value: "HOSTING" },
    { name: 'Invited', current: router.query.holder ? router.query.holder === "false" : false , value: "INVITED" },
  ])
  const { user } = useAuth();
  const [listProjects, setListProjects] = useState([]);

  const handleInfoProject = async (project) => {
    if (project) {
      setTimeout(() => {
        router.push({
          pathname: `projects/[id]`,
          query: {
            id: project.id,
            holder: showProject === "HOSTING"
          }
        },
          `/${router.pathname}`,
          {
            shallow: true
          }
        );
      }, 300);
    }
  };

  useEffect(() => {
    if (user) {
      if(showProject === "HOSTING"){
      let allProject;
      get(query(ref(db, "users/" + user.uid + "/projects"))).then(async (res) => {
        if (res.val()) {
          const listProject = Object.keys(res.val()).map((key) =>
            get(ref(db, "projects/" + key))
              .then((res) => res.val())
              .then((prj) => {
                return ({
                  ...prj,
                  id: key,
                })
              }),
          );
          Promise.all(listProject).then((res) => {
            allProject = res.reverse();
            setListProjects(allProject);
          });
        }
      });

      if (router.query.key) {
        handleInfoProject({ id: router.query.key });
      }
      }
      if(showProject === "INVITED"){
        if (router.query.prj) {
          setKeyProject(router.query.prj)
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
                  setListProjects(stateProjects.reverse())
                  setLoading(false)
                } else {
                  setLoading(false)
                  setListProjects(false)
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
    }

  }, [db, showProject]);

  return (
    <div className="flex flex-col w-8/12 items-center gap-8">
      <h3 className="text-2xl font-bold">Projects Contracts</h3>
      <HeadBar
        event={(value) => {
          setShowProject(value)
          const setTab = tabs.map(tab => {
            if (tab.value === value) {
              tab.current = true
            } else {
              tab.current = false
            }
            return tab
          })
          setTabs(setTab)
        }}
        tabs={tabs}
      />
      <Projects showModel={true} projects={listProjects} fnProjects={handleInfoProject} />
    </div>
  );
};

export default PageHomeProjects;
