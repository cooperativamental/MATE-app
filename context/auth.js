import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getDatabase, ref, child, get, set, query, orderByChild, equalTo, update, serverTimestamp, push } from "firebase/database";
import { setDoc, doc, getDoc, onSnapshot } from "firebase/firestore"
import { auth, registerAuth, deleteAppAuth, dbFirestore } from "../firebase/client";

const AuthContext = createContext({
  user: null,
  login: ({ email, password }) => { },
  logout: () => { },
  // signup: ({ email, password, displayName, photoURL }) => { },
  firestore: null,
  signUpAdmin: () => { }
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [firestore, setFirestore] = useState()
  const db = getDatabase();

  useEffect(() => {
    try {
      setFirestore(dbFirestore)
      const unsubscribe = onAuthStateChanged(auth, (resUser) => {
        if (resUser && dbFirestore) {
          const unSubscribeSnapshot = onSnapshot(doc(dbFirestore, "users", resUser.uid),
            async (res) => {
              console.log(res.data())
              const existInvite = await get(query(ref(db, "inviteTeam"), orderByChild("email"), equalTo(res.data().email)))
              if (existInvite.exists()) {
                const invitation = Object.entries(existInvite.val())
                invitation.map(async ([key, valueTeam]) => {

                  await update(ref(db, `team/${valueTeam.key}/guests/${resUser.uid}`),
                    {

                      email: resUser.email,
                      name: res.data().name,
                      status: "INVITED"

                    }
                  )
                  const getNotRegistered = await (await get(ref(db, `team/${valueTeam.key}/invitedNotRegistered/`))).val()
                  const clearNotRegisteredOnTeam = getNotRegistered.filter( email => email !== resUser.email )
                  await update(ref(db, `team/${valueTeam.key}/`), 
                  {
                    invitedNotRegistered: clearNotRegisteredOnTeam
                  })

                  set(ref(db, "users/" + resUser.uid + "/teamInvite/" + valueTeam.key), {
                    status: "INVITE",
                    createdAt: serverTimestamp(),
                  })
                    .then(async () => {
                      const pushNoti = push(ref(db, `notifications/${resUser.uid}`))
                      set(pushNoti,
                        {
                          type: "INVITE_TEAM",
                          nameTeam: valueTeam.name,
                          viewed: false,
                          open: false,
                          showCard: false,
                          createdAt: serverTimestamp()
                        }
                      )
                      await update(ref(db, "inviteTeam"),
                        {
                          [key]: null
                        }
                      )
                    })
                })
              }

              await updateProfile(auth.currentUser, {
                displayName: res.data().name,
              });
              let addProperties = {};
              if (res.exists()) {
                Object.entries(res.data()).forEach(([key, value]) => {
                  {
                    (key !== "email" && key !== "projects") &&
                      (addProperties = { ...resUser, ...addProperties, [key]: value });
                  }
                },
                );
              }
              setUser(addProperties);
            })
          return () => unSubscribeSnapshot()
        } else {
          setUser(null);
        }
      },
        err => {
          throw new Error(err)
        }
      );
      return () => {
        unsubscribe();
      };

    } catch (err) {
      console.log(err)
    }
  }, [dbFirestore]);

  const login = async ({ email, password }) => {
    try {
      const loginRes = await signInWithEmailAndPassword(auth, email, password)

    } catch (error) {
      console.log(error)
      return ({ error })
    }
  };

  // const signup = async (
  //   { email, password, displayName, photoURL, regFis, priority, name, name, group }
  // ) => {
  //   try {
  //     const regAuth = registerAuth()
  //     const userAuthFirebase = await createUserWithEmailAndPassword(regAuth, email, password)
  //     await updateProfile(regAuth.currentUser, {
  //       displayName: displayName,
  //       photoURL: photoURL
  //     })

  //     setDoc(doc(dbFirestore, "users", regAuth.currentUser.uid),
  //       {
  //         regFis: regFis,
  //         priority: priority,
  //         name: name,
  //         name: name,
  //         group: group,
  //         wallets: [resWallet],
  //         email: email
  //       })

  //     set(ref(db, 'balance/' + regAuth.currentUser.uid), {
  //       balance: 0,
  //       balanceUSD: 0
  //     })
  //     await signOut(regAuth)
  //     await deleteAppAuth()
  //     alert("success")
  //   } catch (error) {
  //     return (
  //       {
  //         error: error.code,
  //         status: false
  //       }
  //     )
  //   }
  // }

  const signUp = async (
    { email, password, displayName, photoURL, regFis, name, team }
  ) => {

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: photoURL
      })
      await setDoc(doc(dbFirestore, "users", auth.currentUser.uid),
        {
          regFis: regFis,
          name: name,
          name: name,
          email: email
        }
      )
      await set(ref(db, 'balance/' + auth.currentUser.uid), {
        balance: 0,
        balanceUSD: 0
      })
    } catch (error) {
      console.log(error)
      return (
        {
          error: error.code,
          status: false
        }
      )
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error);
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, firestore }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };