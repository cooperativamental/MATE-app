import { getDatabase, ref, onValue } from "@firebase/database";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/auth"

const ProjectSheet = ({ keyPrj, project }) => {
    const db = getDatabase();
    const { user } = useAuth()


    return (
        <div className="flex flex-col w-full mt-8 items-center gap-4">
            <div className="flex w-full justify-between font-semibold text-xl">
                {
                    project?.client && Object.entries(project?.client).map(([key, res]) => {
                        return (
                            <h4 key={key}>
                                {res.clientName}
                            </h4>
                        )
                    })
                }
                <h4>{project?.nameProject}</h4>
            </div>
            <hr className=" h-[3px] bg-slate-300 border-[1px] w-full  " />
            <div className="flex w-full justify-between font-semibold text-lg">
                <p>Starting date: </p>
                <p>{project?.start}</p>
            </div>
            <hr className=" h-[3px] bg-slate-300 border-[1px] w-full  " />

            <div className="flex w-full justify-between font-semibold text-lg">
                <p>Project holder: </p>
                {project?.projectHolder && Object.entries(project?.projectHolder).map(([key, titular]) => {
                    return (
                        <p key={key}>
                            {titular.name}
                        </p>
                    )
                })
                }
            </div>
            <hr className=" h-[3px] bg-slate-300 border-[1px] w-full  " />
            <div className="flex w-full justify-between font-semibold text-lg">
                <p className="">Third parties</p>
                <div className="flex gap-4">
                    <p>Amount ◎:</p>
                    <p>{project?.thirdParties?.amount}</p>
                </div>
                {
                    !!project?.thirdParties?.salarysettlement &&
                    <div className="flex gap-4">
                        <p>Canceled:</p>
                        <p>{project?.thirdParties?.salarysettlement}</p>
                    </div>
                }
            </div>
            <hr className=" h-[3px] bg-slate-300 border-[1px] w-full  " />
            <div className="flex flex-col gap-4 w-full justify-between font-semibold text-lg">
                {
                    project?.partners && Object.entries(project?.partners).length > 0 &&
                    <div className="flex flex-col gap-4 w-full justify-between items-center font-semibold text-lg">
                        <h3>Team:</h3>
                        {
                            project?.partners && Object.entries(project?.partners).map(([userId, value]) => {

                                let status = ""
                                if (value.amount <= value.salarysettlement) {
                                    status = "PAID"
                                } else if (value.status === "CONFIRMED") {
                                    status = "Confirmed"
                                } else if (value.status === "REVISION_PARTNER") {
                                    status = "Revision"
                                } else {
                                    status = "Invited"
                                }
                                return (
                                    <div key={userId} className="flex flex-col w-full justify-between gap-4 bg-slate-500 p-8 rounded-md">
                                        <div className="flex w-full justify-between">
                                            <p className="">
                                                {value.name}
                                            </p>
                                            <p>
                                                {status}
                                            </p>
                                        </div>
                                        <div className="flex w-full justify-between">
                                            <p>Amount ◎:</p>
                                            <p>{value.amount}</p>
                                        </div>
                                        <hr className=" h-[1px] bg-slate-300 border-[1px] w-full" />
                                        { 
                                        !!value.salarysettlement &&
                                            <div className="flex w-full justify-between">
                                            <p>Canceled:</p>
                                            <p>{value.salarysettlement}</p>
                                        </div>
                                        }
                                    </div>
                                );

                            })
                        }
                    </div>
                }
            </div>
        </div>
    );
};

export default ProjectSheet;