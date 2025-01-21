import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAymUqzmSaZ2Z_tokzuHoJSIKfvWmLgOgU",
  authDomain: "restaurant-management-63d49.firebaseapp.com",
  databaseURL:"https://restaurant-management-63d49-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "restaurant-management-63d49",
  storageBucket: "restaurant-management-63d49.firebasestorage.app",
  messagingSenderId: "25924795817",
  appId: "1:25924795817:web:ff2b5e801e83a5cf4758b8",
  measurementId: "G-9L1572GQCF",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, query, where };
