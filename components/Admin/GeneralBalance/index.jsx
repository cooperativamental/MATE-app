import { useState, useEffect } from "react"
import {
    getDatabase,
    ref,
    query,
    orderByChild,
    onValue,
    startAt
} from "firebase/database";
import { useAuth } from "../../../context/auth"

const GeneralBalance = () => {
    const db = getDatabase()
    const { user } = useAuth()
    const [scheduledIncome, setScheduledIncome] = useState()
    const [totalBalanceUsers, setTotalBalanceUsers] = useState()
    const [projectsSettled, setProjectsSettled] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if(user){
            const unsubTotalBalanceProjects = onValue(ref(db, `/projects`),
            res => {
                if(res.hasChildren()){
                    const allProjects = res.val()
                    const status = ["CONVOCATORIA", "REVISION_PARTNER", "LIQUIDADO"]
                    const scheduledPartners = Object.entries(allProjects).reduce((acc, [key, project]) => {
                        if (!status.find(sts => sts === project.status)) {
                            const partner = Object.values(project.partners).map(partner => {
                                return new Promise((resolve) => {
                                    if (partner.salarysettlement && partner.amount > partner.salarysettlement) {
                                        if (project.currency === "USD") {
                                            resolve({
                                                USD: (partner.amount - partner.salarysettlement)
                                            })
                                        } else {
                                            resolve({
                                                ARS: (partner.amount - partner.salarysettlement)
                                            })
                                        }
                                    } else if (!partner.salarysettlement) {
                                        if (project.currency === "USD") {
                                            resolve({
                                                USD: partner.amount
                                            })
                                        } else {
                                            
                                            resolve({
                                                ARS: partner.amount
                                            })
                                        }
                                    }
                                })
                            })
                            return [
                                ...acc,
                                ...partner
                            ]
                        }
                        return acc
                    }, [])
                    Promise.all(scheduledPartners).then(promiseScheduledPartner => {
                        let totalScheduled = {
                            ARS: 0,
                            USD: 0
                        }
                        promiseScheduledPartner.map(scheduled=>{
                            if(scheduled.ARS){
                                totalScheduled = {
                                    ...totalScheduled,
                                    ARS: totalScheduled.ARS + scheduled.ARS
                                }
                            }
                            if(scheduled.USD){
                                totalScheduled = {
                                    ...totalScheduled,
                                    USD: totalScheduled.USD + scheduled.USD
                                }
                            }
                        })
                        setScheduledIncome(totalScheduled)
                    })
                }
            }
        )
            const unsubTotalBalanceUsers = onValue(ref(db, `/balance`),
                (res)=>{
                    const allUsers = res.val()
                    let totalBalance = {
                        USD: 0,
                        ARS: 0
                    }
                    Object.entries(allUsers).map(([key, balanceUser])=>{
                        totalBalance = {
                            USD: balanceUser.balanceUSD > 0 ?
                                     totalBalance.USD + balanceUser.balanceUSD :
                                     totalBalance.USD
                                ,
                            ARS: balanceUser.balance > 0 ?
                                    totalBalance.ARS + balanceUser.balance :
                                    totalBalance.ARS
                            
                        }
                    })
                    setTotalBalanceUsers(totalBalance)
                }
            )
    
            const unsubTotalProject = onValue(query(ref(db, `/projects`), orderByChild("createdAt"), startAt(Date.now() - 31557600000)),
            (res)=>{
                if(res.hasChildren()){
                    const allProjects = res.val()
                    let totalProjects = {
                        settled: 0,
                        unsettled: 0
                    }
                    Object.entries(allProjects).map(([key, project])=>{
                        if(project.status === "LIQUIDADO"){
                            totalProjects = {
                                ...totalProjects,
                                settled: totalProjects.settled + 1
                            }
                        } else {
                            totalProjects = {
                                ...totalProjects,
                                unsettled: totalProjects.unsettled + 1
                            }
                        }
                    })
                    setProjectsSettled(totalProjects)
                }
            }
            )
            setLoading(false)
    
            return () => {
                unsubTotalBalanceProjects()
                unsubTotalBalanceUsers()
                unsubTotalProject()
            }
        }
    }, [db, user])


    if (loading) return (
        <div className=" flex  flex-col items-center justify-center w-11/12 h-96  ">
            <div className="animate-spin border-4 border-slate-300 border-l-4 border-l-[#5A31E1] rounded-[50%] h-10 w-10 "></div>
        </div>
    )

    return (
        <div className="flex flex-row justify-between text-center w-11/12 p-14">
            <div className="flex flex-col gap-2 ">
                <div className="  h-12">
                    <p className=" text-base font-normal">Total de Saldos Disponibles</p>
                    <p className=" text-sm font-normal">(no negativos)</p>
                </div>
                <div className="flex flex-col text-4xl  font-normal gap-3 ">
                    <p>
                        {totalBalanceUsers?.ARS.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 })}
                    </p>
                    <p>
                        {totalBalanceUsers?.USD.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="flex flex-col  gap-2">
                <p className="text-base font-normal h-12">Total de Ingresos Programados</p>
                <div className="flex flex-col text-4xl font-normal  gap-3 ">
                    <p>
                        {scheduledIncome?.ARS.toLocaleString('es-ar', { style: 'currency', currency: "ARS", minimumFractionDigits: 2 })}
                    </p>
                    <p>
                        {scheduledIncome?.USD.toLocaleString('es-ar', { style: 'currency', currency: "USD", minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <div className="flex flex-col  gap-2">
                <p className="text-base font-normal h-12">Proyectos Sin Liquidar/Liquidados YTD</p>
                <div className="flex flex-col text-4xl font-normal  gap-3 ">
                    <p>
                        {projectsSettled?.settled}
                    </p>
                    <p>
                        {projectsSettled?.unsettled}
                    </p>

                </div>
            </div>

        </div>
    )
}

export default GeneralBalance