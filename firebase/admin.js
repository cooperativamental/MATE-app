import firebase from 'firebase-admin'

let firestoreApp
const firebaseConfig = {
    "type": process.env.NEXT_PUBLIC_TYPE,
    "project_id": process.env.NEXT_PUBLIC_PROJECT_ID,
    "private_key_id": process.env.NEXT_PUBLIC_PRIVATE_KEY_ID,
    "private_key": process.env.NEXT_PUBLIC_PRIVATE_KEY,
    "client_email": process.env.NEXT_PUBLIC_CLIENT_EMAIL,
    "client_id": process.env.NEXT_PUBLIC_CLIENT_ID,
    "auth_uri": process.env.NEXT_PUBLIC_AUTH_URI,
    "token_uri": process.env.NEXT_PUBLIC_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.NEXT_PUBLIC_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.NEXT_PUBLIC_CLIENT_X509_CERT_URL
};

if (!firebase.apps.length) {
    const app = firebase.initializeApp({
        credential: firebaseConfig,
        databaseURL: "https://solana-b6be8-default-rtdb.firebaseio.com"
    }, "admin");
    firestoreApp = firebase.database()
}

firestoreApp = firebase.app("admin").database()

export default firestoreApp