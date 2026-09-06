import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-LVtAsj0ih-qrJFz3-VbQIywcJ7rbRdc",
  authDomain: "sally-s-beauty-secrete.firebaseapp.com",
  projectId: "sally-s-beauty-secrete",
  messagingSenderId: "269310000690",
  appId: "1:269310000690:web:6c0b01863bf19c235b462b",
  measurementId: "G-ERTLKR8V7R"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
