import { getDatabase, ref, update, set, push, get, onValue, serverTimestamp } from "@firebase/database";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import { useHost } from "../../context/host";
import { sendEmail } from "../../functions/sendMail"
import ComponentButton from "../Elements/ComponentButton";
import InputSelect from "../Elements/InputSelect";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "../../hooks/useProgram/index.ts"

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"


const CallProject = ({ keyProject }) => {
  const db = getDatabase();
  const { user } = useAuth();
  const [project, setProject] = useState();
  const { host } = useHost()
  const [revision, setRevision] = useState(0)
  const [wallets, setWallets] = useState()
  const [selectWallet, setSelectWallet] = useState()

  const { connection } = useConnection()
  const wallet = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  // const [balance, setBalance] = useState()

  useEffect(() => {
    if (program?.account?.group) {

      const unsubscribe = onValue(ref(db, `wallet/${user?.uid}`),
        async (res) => {
          const resTeamWeb3 = await program?.account?.group?.all()
          const findTeam = resTeamWeb3?.find(team => team.publicKey.toBase58() === project?.team)
          const convertWalletsInTeam = findTeam?.account?.members?.map(member => member.toBase58())
          const filterWalletInTeam = Object.entries(res.val()).filter(([keyWallet, wallet]) => convertWalletsInTeam?.includes(wallet.publicKey))
          const objWalletsInTeam = Object.fromEntries(filterWalletInTeam)
          setWallets(objWalletsInTeam)
        }
      )
      return () => {
        unsubscribe()
      }
    }
  }, [db, user, program?.account?.group, project, connection, wallet])

  useEffect(() => {
    if (keyProject && user) {
      const unsubscribe = onValue(ref(db, `projects/${keyProject}`), res => {
        setProject(res.val())
      })

      return () => {
        unsubscribe()
      }
    }
  }, [db, user, keyProject ])


  const comfirmProject = () => {
    update(ref(db, `projects/${keyProject}/partners/${user.uid}`), {
      status: "CONFIRMED",
      wallet: selectWallet
    })
      .then((res) => {
        update(ref(db, `users/${user.uid}/projects/${keyProject}`), {
          status: "CONFIRMED",
          wallet: selectWallet
        }).then(res => {
          const pushNoti = push(ref(db, `notifications/${Object.keys(project.projectHolder).map(key => key)}`))
          let cliName = ""
          Object.values(project.client).forEach(client => cliName = client.clientName)

          set(pushNoti,
            {
              type: "CONFIRM_PARTNER",
              namePartner: user.displayName,
              projectID: keyProject,
              client: cliName,
              nameProject: project.nameProject,
              viewed: false,
              open: false,
              showCard: false,
              createdAt: serverTimestamp()
            })
            .then(res => {
              sendEmail(
                {
                  from: {
                    email: user.email,
                    name: user.fullName
                  },
                  to: {
                    ...Object.values(project.projectHolder)
                      .map(values => ({
                        name: values.fullName,
                        email: values.email
                      }))[0]
                  },
                  subject: `${user.fullName} confirma participación`,
                  redirect: `${host}/adminprojects?prj=${keyProject}`,
                  text: [
                    `El socio ${user.fullName}`,
                    `Confimó su participación en ${project.nameProject}, de ${cliName}`
                  ],
                }
              )
            })
        }
        )
      })
      .catch((err) => console.error(err));
  };

  const sendRevision = () => {
    update(ref(db, `projects/${keyProject}`), {
      status: "REVISION_PARTNER",
    }).then(res => {
      update(ref(db, `projects/${keyProject}/partners/${user.uid}`), {
        status: "REVISION_PARTNER",
        revision: revision
      })
        .then((res) => {
          update(ref(db, `users/${user.uid}/projects/${keyProject}`), {
            status: "REVISION_PARTNER",
            revision: revision
          }).then(res => {
            const pushNoti = push(ref(db, `notifications/${Object.keys(project.projectHolder).map(key => key)}`))
            let cliName = ""
            Object.values(project.client).forEach(client => cliName = client.clientName)

            set(pushNoti,
              {
                type: "REVISION_PARTNER",
                petitioner: user.displayName,
                projectID: keyProject,
                client: cliName,
                nameProject: project.nameProject,
                viewed: false,
                open: false,
                showCard: false,
                createdAt: serverTimestamp()
              }
            )
            sendEmail(
              {
                from: {
                  name: user.fullName,
                  email: user.email
                },
                to: {
                  name: project.projectHolder.fullName,
                  email: project.projectHolder.email
                },
                subject: `${user.fullName} Requests review`,
                redirect: `${host}//adminprojects?prj=${keyProject}`,
                text: [
                  `The partner ${user.fullName}, `,
                  `requests review on ${project.nameProject} for ${cliName}`,
                  `to ${project.currency} ${revision}.`
                ],
              }
            )
          }
          )
        })
    })
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex flex-col gap-4 mt-12 w-8/12">
      <div className="flex text-xl w-full justify-between font-semibold">
        <h4 >{project?.client && Object.values(project?.client).map(res => res.clientName)}</h4>
        <h4>{project?.nameProject}</h4>
      </div>
      <hr className="h-[3px] bg-slate-300 border-[1px] w-full" />

      <div className="flex text-xl w-full justify-between font-normal">
        <p>Kickoff date: </p>
        <p>{project?.start}</p>
      </div>
      <div className="flex text-xl w-full justify-between font-normal">
        <p>Project holder: </p>
        <p>{project?.projectHolder && Object.values(project?.projectHolder).map(titular => titular.fullName)}</p>
      </div>
      {/* <div className="flex text-xl w-full justify-between font-normal">
        <p>Treasury project: </p>
        <p>{balance}</p>
      </div> */}
      <div>
        <h3>Called up team:</h3>
        {
          project && project?.partners &&
          <div className="flex flex-col w-full justify-between gap-4 bg-slate-700 p-8 rounded-md">
            <div className="flex justify-between w-full">
              <h5>Partner: </h5>
              <h5>{user.fullName}</h5>
            </div>
            <hr className="h-[3px] bg-slate-300 border-[1px] w-full" />

            <div className="flex justify-between w-full">
              <p>Amount agreed: </p>
              <p>{project?.partners?.[user.uid]?.amount?.toLocaleString('es-ar', { style: 'currency', currency: project?.currency, minimumFractionDigits: 2 })}</p>
            </div>
            {/* {
              project.partners[user.uid].salarysettlement &&
              <div className="flex justify-between w-full">
                <p>Monto liquidado:</p>
                <p>{project?.partners?.[user?.uid]?.salarysettlement?.toLocaleString('es-ar', {style: 'currency', currency: project?.currency, minimumFractionDigits: 2})}</p>
              </div>
            } */}
            {
              project?.partners && project?.partners[user.uid].status === "ANNOUNCEMENT" &&
              <div className="flex flex-col items-center gap-8">
                {
                  (!connection || !wallet) ?
                              <WalletMultiButton>Connect Wallet</WalletMultiButton>

                    :
                    <>
                      <InputSelect
                        select
                        onChange={(e) => setSelectWallet(e.target.value)}
                        optionDisabled="SelectWallet"
                        name="wallet"
                        title="Select your wallet"
                      >
                        {
                          wallets && Object.entries(wallets).map(([keyWallet, wallet]) => {
                            return (
                              <option key={keyWallet}>
                                {wallet.publicKey}
                              </option>
                            )
                          })
                        }
                      </InputSelect>
                      <ComponentButton
                        buttonEvent={comfirmProject}
                        buttonText="Confirm"
                      />
                    </>
                }

                <hr className="h-[3px] bg-slate-300 border-[1px] w-full" />

                {/* <div className="flex flex-col items-center gap-4">
                  <p>{'If the amount was not as agreed, please enter the amount it should be and press the Review button.'}</p>
                  <InputSelect
                    type="number"
                    value={revision.toString()}
                    onChange={(e) => setRevision(Number(e.target.value))}
                  />
                  <ComponentButton
                    buttonEvent={sendRevision}
                    buttonText="Review"
                  />
                </div> */}
              </div>
            }
          </div>
        }
        {
          project?.partners && Object.entries(project?.partners).length > 1 &&
          <div className="flex flex-col w-full justify-between gap-4  ">
            <h3>Called up team:</h3>
            {
              project?.partners && Object.entries(project?.partners).map(([userId, value]) => {
                if (userId !== user.uid) {
                  let status = ""
                  if (value.amount >= value.salarysettlement) {
                    status = "Canceled"
                  } else if (value.status === "CONFIRMED") {
                    status = "Confirmed"
                  } else if (value.status === "REVISION_PARTNER") {
                    status = "Revision"
                  } else {
                    "Convocado"
                  }
                  return (
                    <div key={userId} className="flex justify-between w-full text-base rounded-md bg-slate-700 p-8 font-normal">
                      <p>{value.fullName}</p>
                      <p>
                        {status}
                      </p>
                    </div>
                  );
                }
              })
            }
          </div>
        }
      </div>
    </div >
  );
};

export default CallProject;