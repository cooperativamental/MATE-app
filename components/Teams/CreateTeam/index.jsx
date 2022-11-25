import { useState, useEffect } from "react";
import { useRouter } from "next/router"

import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useProgram } from "../../../hooks/useProgram/index.ts"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import {
  getDatabase, serverTimestamp,
  ref, set, push, get
} from "firebase/database";
import { doc, updateDoc, collection, arrayUnion, getDocs, getDoc, where, query as queryFirestore } from "firebase/firestore"

import { useAuth } from "../../../context/auth";
import { useHost } from "../../../context/host";
import { usePopUp } from "../../../context/PopUp"
import InputSelect from "../../Elements/InputSelect"
import ComponentButton from "../../Elements/ComponentButton";
import { MultiSelectPartners } from "../../MultiSelectPartners";
import { sendEmail } from "../../../functions/sendMail";
import Image from "next/image";
import { EnvelopeIcon, MinusIcon } from "@heroicons/react/20/solid";

const CreateTeams = () => {
  const db = getDatabase()
  const { firestore, user } = useAuth()
  const router = useRouter()
  const {host} = useHost()

  const { handlePopUp } = usePopUp()

  const { connection } = useConnection()
  const wallet = useAnchorWallet();
  const { program } = useProgram({ connection, wallet });
  const { publicKey } = useWallet()

  const [errors, setErrors] = useState({})
  const [listPartners, setListPartners] = useState()
  const [listMate, setListMate] = useState()
  const [notRegistered, setNotRegistered] = useState([])
  const [team, setTeam] = useState({
    status: "INVITE",
    name: "",
    // activity: "",
    treasury: 0,
  });
  const [retrySendProposal, setRetrySendProporsal] = useState({
    status: false,
  })


  useEffect(() => {
    const arrErrors = Object.entries(team).map(([prop, value]) => {
      return [prop, !value]
    })
    const objErrors = Object.fromEntries(arrErrors)
    setErrors(objErrors)
  }, [listPartners, team])

  useEffect(() => {
    (async () => {
      const creatorUser = await getDoc(doc(firestore, "users", user.uid))

      setListPartners({
        ...listPartners,
        [user.uid]: {
          email: creatorUser.data().email,
          name: creatorUser.data().name,
          status: "CONFIRMED"
        }
      })
      setTeam({
        ...team,
        teamCreator: {
          [user.uid]: {
            email: creatorUser.data().email,
            name: creatorUser.data().name,
          }
        }
      })
    })()

  }, [publicKey])

  const searchMates = async (searchMate) => {

    const usersWallet = await getDocs(
      queryFirestore(
        collection(firestore, "users"),
        where("wallets", "array-contains", searchMate)
      ))
    const usersEmail = await getDocs(
      queryFirestore(
        collection(firestore, "users"),
        where('email', '>=', searchMate),
        where('email', '<=', searchMate + '\uf8ff')
      ))
    let resMates = {}

    if (!usersWallet.empty) {
      usersWallet.forEach(user => {
        if (!listPartners[user.id]) {
          resMates = {
            ...resMates,
            [user.id]: {
              email: user.data().email,
              name: user.data().name,
              status: "INVITED"
            }
          }
        }
      })
    }
    if (!usersEmail.empty) {
      usersEmail.forEach(user => {
        if (!listPartners[user.id]) {
          resMates = {
            ...resMates,
            [user.id]: {
              email: user.data().email,
              name: user.data().name,
              status: "INVITED"
            }
          }
        }
      })
    }

    if (usersWallet.empty && usersEmail.empty) {
      if (
        searchMate.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
      ) {
        setNotRegistered([
          ...notRegistered,
          searchMate
        ])
      }
    }

    if (listPartners && Object.keys(listPartners).length) {
      setListMate({
        // ...listPartners,
        ...resMates
      })
    } else {
      setListMate({
        ...resMates
      })
    }
  }
  const teamChange = (e) => {
    if (e.target.name === "treasury") {
      setTeam({
        ...team,
        [e.target.name]: Number(e.target.value),
      });
    } else {
      setTeam({
        ...team,
        [e.target.name]: e.target.value,
      });
    }
  };

  const sendInviteMate = (keyTeam) => {
    notRegistered.map((email) => {
      const pushInviteTeam = push(ref(db, `inviteTeam`))
      set(pushInviteTeam,
        {
          key: keyTeam,
          name: team.name,
          email: email
        }
      )
      .then(()=>{
        sendEmail(
          {
            from: {
              name: user.name,
              email: user.email
            },
            to: {
              email: email
            },
            subject: "New team invitation",
            redirect: `${host}/register`,
            text: [
              `Member: ${user.name},`,
              `Invites you to join ${team.name}.`
            ],
          }
        )
      })
    })
  }

  const sendProposal = (keyTeam) => {
    return new Promise((resolve, reject) => {
      const proposalPartner = Object.entries(listPartners).map(([key, valuePartner]) => {
        if (key !== user?.uid) {
          return new Promise((resolve, reject) => {
            set(ref(db, "users/" + key + "/teamInvite/" + keyTeam), {
              status: key !== user?.uid ? "INVITE" : "CONFIRMED",
              createdAt: serverTimestamp(),
            })
              .then((snapshot) => {
                const pushNoti = push(ref(db, `notifications/${key}`))
                set(pushNoti,
                  {
                    type: "INVITE_TEAM",
                    nameTeam: team.name,
                    viewed: false,
                    open: false,
                    showCard: false,
                    createdAt: serverTimestamp()
                  }
                )
                  .then(res => {
                    sendEmail(
                      {
                        from: {
                          name: user.name,
                          email: user.email
                        },
                        to: {
                          name: valuePartner.name,
                          email: valuePartner.email
                        },
                        subject: "New team invitation",
                        redirect: `${host}/teams/${keyTeam}`,
                        text: [
                          `Member: ${user.name},`,
                          `Invites you to join ${team.name}.`
                        ],
                      }
                    )
                  })
                  .catch(err => {
                    console.log(err)
                  })
                resolve("Proposal Sent")
              })
              .catch((error) => {
                // The write failed...
                console.log(error);
                reject(error)
              });
          })
        }
      })
      Promise.all(proposalPartner)
        .then(res => {
          resolve("All proposals were successfully submitted")
        })
        .catch(err => {
          reject(`Sorry, there was an error, please try again, ${err}`)
        })
    })
  }


  const createTeam = async () => {
    const teamRef = ref(db, "team/");
    const pushTeam = push(teamRef);
    set(pushTeam, {
      ...team,
      guests: listPartners,
      createdAt: serverTimestamp(),
      invitedNotRegistered: notRegistered
    })
      .then((snapshot) => {
        set(ref(db, "users/" + user.uid + "/teamCreator/" + pushTeam.key), {
          name: team.name,
          status: "INVITE"
        })
        sendInviteMate(pushTeam.key)
        sendProposal(pushTeam.key)
          .then(res => {
            setTeam({
              ...team,
              name: "",
              // activity: "", 
              treasury: 0,
            })
            setRetrySendProporsal({
              status: false,
            })
            handlePopUp({
              text: "Invitations Sent",
              onClick: () => {
                router.push({
                  pathname: "/teams/confirmteam/[team]",
                  query: {
                    team: pushTeam.key
                  }
                })
              }
            })
          })
          .catch(err => {
            console.log(err)
            setRetrySendProporsal({
              status: true,
              key: pushTeam.key
            })
          })
      })
      .catch((error) => {
        // The write failed...
        console.error(error);
      });
  }

  return (
    <div className="flex flex-col w-6/12 items-center gap-8 pb-4 h-min mt-12">
      <h1 className=" text-xl font-medium">New Team</h1>
      <p>Build your team with partners, not employees. To manage collaborative ownership projects.</p>

      <InputSelect
        id="name"
        placeholder="Team Name"
        type="text"
        name="name"
        title="Choose a name for your team."
        value={team.name}
        onChange={teamChange}
        inputStyle="text-center"
      />
      {/* <InputSelect
        id="activity"
        placeholder="Activity"
        type="text"
        name="activity"
        value={team.activity}
        onChange={teamChange}
        inputStyle="text-center"
      /> */}
      <InputSelect
        id="treasury"
        placeholder="Team treasury %"
        type="number"
        name="treasury"
        value={team.treasury.toString()}
        onChange={teamChange}
        title="Select treasury rate"
        subtitle="Set a slice of the projects budget for later rewards and bonuses."
        inputStyle="text-center"
      />
      <h2 className="mt-1 text-xl text-white font-bold">Invite Mate Protocol users to join your team.</h2>
      <MultiSelectPartners
        options={listMate}
        setOptions={setListMate}
        blockOption={user?.uid}
        searchFunction={searchMates}
        selectState={listPartners}
        setSelectState={setListPartners}
      />
      <div className="w-full">
        <ul role="list" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {
            notRegistered?.map(emailInvite => (
              <li
                key={emailInvite}
                className={`group outline-none ring-2 ring-indigo-500 ring-offset-2 flex w-full items-center h-12 justify-between space-x-3 rounded-full border border-gray-300 p-2 text-left shadow-sm hover:bg-gray-50 hover:text-gray-900`}
              >
                <div className="flex min-w-0 flex-1 pl-2 items-center space-x-3">
                  <span className="block truncate text-sm font-medium">{emailInvite}</span>
                </div>
                <EnvelopeIcon
                  className="h-full"
                />
                <MinusIcon
                  onClick={() => {
                    const notInvite = notRegistered.filter((email)=>
                      email !== emailInvite 
                    )
                    setNotRegistered(notInvite)
                  }}
                  className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true"
                />
              </li>
            ))
          }
        </ul>
      </div>
      <ComponentButton
        // className="flex h-12 w-max bg-[#5A31E1] rounded-xl text-3xl text-white font-medium items-center p-6 "
        buttonEvent={createTeam}
        buttonText="Send Invites"
        conditionDisabled={errors && Object.values(errors).find(prop => !!prop)}
      />
    </div>
  );
}

export default CreateTeams