import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyDHb6JQTEMsKhgynJgMG_6wKrKEkXrh_3s",
    authDomain: "tcdbank-2021f.firebaseapp.com",
    projectId: "tcdbank-2021f",
    storageBucket: "tcdbank-2021f.appspot.com",
    messagingSenderId: "923143263314",
    appId: "1:923143263314:web:52c9cf690b3b969e85bb8b",
    measurementId: "G-ZMEHLQMHC6"
  };

// Initialize Firebase and Firebase Authentication
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app);



export {auth, db}