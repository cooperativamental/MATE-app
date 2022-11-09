import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getDatabase, ref, child, get, set } from "firebase/database";
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
            return ()=> unSubscribeSnapshot()
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