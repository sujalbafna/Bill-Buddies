import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAunTVx_54oc01AayAe-gW6CYWA9VdD7vE",
  authDomain: "ai-assistant-210d2.firebaseapp.com",
  projectId: "ai-assistant-210d2",
  storageBucket: "ai-assistant-210d2.firebasestorage.app",
  messagingSenderId: "623614890565",
  appId: "1:623614890565:web:b8cf585ae1558789a4492c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);