import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import Projects from "../../../components/Projects";

import { getDatabase, ref, query, get } from "firebase/database";
import { useAuth } from "../../../context/auth";

import styles from "./projects.module.scss";

const PageHomeProjects = () => {
  const router = useRouter();
  const db = getDatabase();
  const { user } = useAuth();
  const [listProjects, setListProjects] = useState([]);

  const handleInfoProject = async (project) => {
    if (project) {
      setTimeout(() => {
        router.push(`projects/${project.id}`);
      }, 300);
    }
  };

  useEffect(() => {
    if (user) {
      let allProject;
      get(query(ref(db, "users/" + user.uid + "/projects"))).then(async (res) => {
        if (res.val()) {
          const listProject = Object.keys(res.val()).map((key) =>
            get(ref(db, "projects/" + key))
              .then((res) => res.val())
              .then((prj) => ({
                ...prj,
                id: key,
              })),
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

  }, []);

  return (
      <Projects showModel={true} projects={listProjects} fnProjects={handleInfoProject} />
  );
};

export default PageHomeProjects;
