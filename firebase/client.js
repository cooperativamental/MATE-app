import { initializeApp, getApp, getApps, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

let app, analytics, register

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MESUREMENTID,
};

if (getApps().length) {
  app = getApp();
} else {
  app = initializeApp(firebaseConfig);
  register = () => { return initializeApp(firebaseConfig, "registerApp") }
}
if (app.name && typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  
}
const auth = getAuth(app);
const registerAuth = () => { return getAuth(register()) }
const deleteAppAuth = () => { return deleteApp(register())}

const dbFirestore = getFirestore(app)

export { auth, analytics, registerAuth, deleteAppAuth, dbFirestore }
