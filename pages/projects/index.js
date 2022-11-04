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
    (() => {
      let showPrj = ""
      if (router.query.holder) {
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
    { name: 'Hosting', current: router.query.holder ? router.query.holder === "true" : true, value: "HOSTING" },
    { name: 'Invited', current: router.query.holder ? router.query.holder === "false" : false, value: "INVITED" },
  ])
  const { user } = useAuth();
  const [listProjects, setListProjects] = useState([]);

  const handleInfoProject = async (project) => {
    if (project) {
      setTimeout(() => {
        router.push({
          pathname: `projects/[id]`,
          query: {
            id: project,
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
      if (showProject === "INVITED") {

        get(query(ref(db, "users/" + user.uid + "/projects"))).then(async (res) => {
          if (res.val()) {
            const listProject = Object.keys(res.val()).map((key) =>
              get(ref(db, "projects/" + key))
                .then((res) => res.val())
                .then((prj) => {
                  const arrPartner = Object.entries(prj.partners).map(([keyPartner, partner]) => {
                    return {
                      id: keyPartner,
                      name: partner.name || partner.fullName,
                    }
                  })
                  console.log(arrPartner)
                  return ({
                    partners: arrPartner,
                    name: prj.nameProject,
                    redirect: () => handleInfoProject(key),
                    info: `Client: ${Object.values(prj.client).map(client => client.clientName)[0]}`,
                    id: key,
                  })
                }),
            );
            Promise.all(listProject).then((res) => {
              const reverseProject = res.reverse();
              setListProjects(reverseProject);
            });
          }
        });

        if (router.query.key) {
          handleInfoProject(router.query.key);
        }
      }
      if (showProject === "HOSTING") {
        if (router.query.prj) {
          setKeyProject(router.query.prj)
        }
        const unsubscribe = onValue(
          query(ref(db, `users/${user.uid}/projectsOwner`), orderByValue("createdAt"))
          , (res) => {
            const unsub = onValue(ref(db, "projects/"),
              resPrj => {
                if (res.hasChildren()) {
                  const stateProjects = Object.entries(resPrj.val()).map(([key, value]) => {
                    return Object.keys(res.val()).map(keyPrjOwn => {
                      if (keyPrjOwn === key) {
                        const arrPartner = Object.entries(value.partners).map(([keyPartner, partner]) => {
                          return {
                            id: keyPartner,
                            name: partner.name || partner.fullName,
                          }
                        })
                        console.log(arrPartner)
                        return {
                          name: value.nameProject,
                          info: `Client: ${Object.values(value.client).map(client => client.clientName)[0]}`,
                          partners: arrPartner,
                          redirect: () => handleInfoProject(key),
                          id: key,
                        }
                      }
                    }).filter(prj => !!prj)[0]
                  }).filter(prj => !!prj)
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
        if (router.query.key) {
          handleInfoProject({ id: router.query.key });
        }
        return () => {
          unsubscribe()
          // }
        }

      }
    }

  }, [db, router.query.key, router.query.prj, showProject, user]);

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
