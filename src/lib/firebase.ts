// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth'; // If using Auth
// Import other Firebase services as needed (e.g., getFunctions, connectFunctionsEmulator)

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Lazy-initialized instances
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>; // If using

const EMULATORS_STARTED = 'EMULATORS_STARTED';

function connectEmulators() {
  if (global[EMULATORS_STARTED]) {
    return; // Prevent re-connection during HMR
  }

  // This function can be called multiple times in dev, so we guard it
  try {
    if (process.env.NODE_ENV === 'development') {
      connectFirestoreEmulator(getFirestore(app), 'localhost', 8080);
      connectAuthEmulator(getAuth(app), 'http://localhost:9099');
      console.log("Connected to local Firebase emulators.");
      (global as any)[EMULATORS_STARTED] = true;
    }
  } catch(e) {
    // Emulator may not be running
    console.log("Could not connect to emulators, likely in production mode or emulators not running.");
  }
}

connectEmulators();

db = getFirestore(app);
auth = getAuth(app);


export { db, auth };
