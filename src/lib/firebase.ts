
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-1993382069-dda9e",
  "appId": "1:527931530508:web:7028e92b7a31a427c67d29",
  "storageBucket": "studio-1993382069-dda9e.firebasestorage.app",
  "apiKey": "AIzaSyB0vmgmtE_xE1zJkf_jd9nseEutzmiF7AA",
  "authDomain": "studio-1993382069-dda9e.firebaseapp.com",
  "messagingSenderId": "527931530508"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log("Firestore emulator connected");
  } catch (e) {
    console.error("Error connecting to Firestore emulator", e);
  }
}

export { db };
