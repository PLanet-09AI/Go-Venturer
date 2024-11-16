import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDh198JlC73HYzqHB8r2nbOR-MgnQWXi3Y",
  authDomain: "lastappointment-490db.firebaseapp.com",
  databaseURL: "https://lastappointment-490db-default-rtdb.firebaseio.com",
  projectId: "lastappointment-490db",
  storageBucket: "lastappointment-490db.firebasestorage.app",
  messagingSenderId: "529258445292",
  appId: "1:529258445292:web:70e23795f0d5200d8ca8c9",
  measurementId: "G-74XN13DKMV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);