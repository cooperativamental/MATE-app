import firebase from 'firebase-admin'
import serviceAccount from "./firebase-keys.json"

let firestoreApp

if(!firebase.apps.length){
    const app = firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://solana-b6be8-default-rtdb.firebaseio.com"
    }, "admin");
    firestoreApp = firebase.database()
}

firestoreApp = firebase.app("admin").database()

export default firestoreApp