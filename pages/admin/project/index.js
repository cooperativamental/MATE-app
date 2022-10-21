import { useRouter } from "next/router"
import AdminProjects from "../../../components/AdminProjects";
import Admin from "../../../components/Admin"
import ComponentButton from "../../../components/Elements/ComponentButton"
import { useEffect, useState } from "react";
import {
    get,
    getDatabase,
    ref
} from "firebase/database";

const Projects = () => {
    const db = getDatabase()
    const router = useRouter()
    const [teams, setTeams] = useState()
    const [selectTeam, setSelectTeam] = useState()

    useEffect(() => {
        get(ref(db, "teams"))
            .then(res => {
                setTeams(res.val())
            })
    }, [])

    return (
        <Admin>
            <div className="flex flex-col overflow-y-auto scrollbar w-full h-[calc(100%_-_3rem)] mt-4 px-4">
                {
                    (router.pathname === "/admin/project" && router.query.prj) &&
                    <ComponentButton
                        isBack
                        routeBack={() => router.push({
                            pathname: router.pathname,
                            query: router.pathname === "/admin/project" && { type: "PROJECT" },
                        }, router.pathname, { shallow: true })}
                    />
                }
                {
                    (!router.query.prj) &&
                    <select
                        defaultValue={0}
                        className={`flex border rounded-xl h-16 p-4 text-xl shadow-sm `}
                        onChange={(e) => setSelectTeam(e.target.value)}
                    >
                        <option value={0} disabled>Seleccionar Grupo</option>
                        {
                            teams &&
                            Object.entries(teams).map(([key, team]) => {
                                return (
                                    <option key={key} value={key}>
                                        {team.businessName}
                                    </option>
                                )
                            })
                        }
                    </select>
                }
                {
                    (selectTeam || router.query.team) &&
                    <AdminProjects team={selectTeam || router.query.team} prj={router.query.prj} />
                }
            </div>
        </Admin>
    );
};

export default Projects;
