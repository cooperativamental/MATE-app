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
    const [organizations, setOrganizations] = useState()
    const [selectOrganization, setSelectOrganization] = useState()

    useEffect(() => {
        get(ref(db, "organizations"))
            .then(res => {
                setOrganizations(res.val())
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
                        onChange={(e) => setSelectOrganization(e.target.value)}
                    >
                        <option value={0} disabled>Seleccionar Grupo</option>
                        {
                            organizations &&
                            Object.entries(organizations).map(([key, organization]) => {
                                return (
                                    <option key={key} value={key}>
                                        {organization.businessName}
                                    </option>
                                )
                            })
                        }
                    </select>
                }
                {
                    (selectOrganization || router.query.organization) &&
                    <AdminProjects organization={selectOrganization || router.query.organization} prj={router.query.prj} />
                }
            </div>
        </Admin>
    );
};

export default Projects;
