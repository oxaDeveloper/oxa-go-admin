import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACwkY0-qHLqWj0WDH9KSyl5aBUr0k4UbQ",
  authDomain: "oxa-go.firebaseapp.com",
  projectId: "oxa-go",
  storageBucket: "oxa-go.appspot.com",
  messagingSenderId: "493802045607",
  appId: "1:493802045607:web:13dadf7374a7693c821b82",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
