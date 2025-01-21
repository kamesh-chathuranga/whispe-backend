import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBW0cV5Oc2zFN_PbgmoUCp3m5j5v9FI2SE",
  authDomain: "chatter-app-2bbab.firebaseapp.com",
  projectId: "chatter-app-2bbab",
  storageBucket: "chatter-app-2bbab.firebasestorage.app",
  messagingSenderId: "803859582500",
  appId: "1:803859582500:web:d75de35d1b66ae5f3392b1",
  measurementId: "G-F1LZB2YL4R",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
