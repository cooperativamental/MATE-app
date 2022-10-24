import { useState, useEffect } from "react";

import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useProgram } from "../../hooks/useProgram/index.ts"
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import {
    getDatabase, serverTimestamp,
    ref, set, push, get
  } from "firebase/database";
import { doc, updateDoc, collection, arrayUnion, getDocs, getDoc, where, query as queryFirestore } from "firebase/firestore"

import { useAuth } from "../../context/auth";

import InputSelect from "../Elements/InputSelect"
import ComponentButton from "../Elements/ComponentButton";
import { MultiSelectPartners } from "../../MultiSelectPartners";
import { sendEmail } from "../../functions/sendMail";

const CreateTeams = () => {
    const db = getDatabase()
    const { firestore, user } = useAuth()

    const { connection } = useConnection()
    const wallet = useAnchorWallet();
    const { program } = useProgram({ connection, wallet });
    const { publicKey } = useWallet()

    const [errors, setErrors] = useState({})
    const [listPartners, setListPartners] = useState()
    const [listMate, setListMate] = useState()
    const [team, setTeam] = useState({
        status: "INVITE",
        name: "",
        activity: "",
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
                const { userName, ...resUser } = creatorUser.data()

                setListMate({
                    ...listMate,
                    [user.uid]: {
                        email: creatorUser.data().email,
                        name: creatorUser.data().userName,
                        status: "CONFIRMED"
                    }
                })
                setListPartners({
                    ...listPartners,
                    [user.uid]: {
                      email: creatorUser.data().email,
                      name: creatorUser.data().userName,
                      status: "CONFIRMED"
                    }
                })
                setTeam({
                  ...team,
                  teamCreator: {
                    [user.uid]: {
                      email: creatorUser.data().email,
                      name: creatorUser.data().userName,
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
        let resPartners = {}

        if (!usersWallet.empty) {
            usersWallet.forEach(user => {
                resPartners = {
                    ...resPartners,
                    [user.id]: {
                        email: user.data().email,
                        name: user.data().userName,
                        status: "INVITED"
                    }
                }
            })
        }
        if (!usersEmail.empty) {
            usersEmail.forEach(user => {
                resPartners = {
                    ...resPartners,
                    [user.id]: {
                      email: user.data().email,
                      name: user.data().userName,
                      status: "INVITED"
                    }
                }
            })
        }


        if (listPartners && Object.keys(listPartners).length) {
            setListMate({
                ...listPartners,
                ...resPartners
            })
        } else {
            setListMate({
                ...resPartners
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
                        projectID: keyTeam,
                        projectCreator: user?.displayName,
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
                              name: user.fullName,
                              email: user.email
                            },
                            to: {
                              name: valuePartner.fullName,
                              email: valuePartner.email
                            },
                            subject: "New team invitation",
                            redirect: `${host}/projects/${keyTeam}`,
                            text: [
                              `Member: ${user.fullName},`,
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
        })
          .then((snapshot) => {
            set(ref(db, "users/" + user.uid + "/teamCreator/" + pushTeam.key), {
              name: team.name,
            })
            sendProposal(pushTeam.key)
              .then(res => {
                setTeam({
                    ...team,
                    name: "",
                    activity: "",
                    treasury: 0,
                })
                setRetrySendProporsal({
                  status: false,
                })
                alert("Send Invitations")
                // router.push({
                //   pathname: "/adminprojects",
                //   query: { type: "NEW_PROJECT", key: pushTeam.key }
                // })
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
                value={team.name}
                onChange={teamChange}
                inputStyle="text-center"
            />
            <InputSelect
                id="activity"
                placeholder="Activity"
                type="text"
                name="activity"
                value={team.activity}
                onChange={teamChange}
                inputStyle="text-center"
            />
            <InputSelect
                id="treasury"
                placeholder="Team treasury %"
                type="number"
                name="treasury"
                value={team.treasury.toString()}
                onChange={teamChange}
                title="Fund the Treasury. Set aside a slice (%) of the project’s budget for later rewards and bonuses"
                inputStyle="text-center"
            />
            {/* <MultiSelect
                label="Search your Team Mate"
                options={listMate}
                searchFunction={setSearchMate}
                selectState={listPartners}
                setSelectState={setListPartners}
            /> */}
            {/* <WalletMultiButton />
            {
                (!!connection && !!publicKey) &&
                <> */}
                    <MultiSelectPartners
                        options={listMate}
                        blockOption={user?.uid}
                        searchFunction={searchMates}
                        selectState={listPartners}
                        setSelectState={setListPartners}
                    />
                    <ComponentButton
                        // className="flex h-12 w-max bg-[#5A31E1] rounded-xl text-3xl text-white font-medium items-center p-6 "
                        buttonEvent={createTeam}
                        buttonText="Invite Team"
                        conditionDisabled={errors && Object.values(errors).find(prop => !!prop)}
                    />
                {/* </>
            } */}




        </div>
    );
}

export default CreateTeams