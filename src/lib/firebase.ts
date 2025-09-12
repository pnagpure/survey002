// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth'; // If using Auth

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (singleton)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Lazy-initialized instances
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;

const EMULATORS_STARTED = 'EMULATORS_STARTED';

function connectToEmulators() {
  // Prevent re-connection during HMR
  if ((global as any)[EMULATORS_STARTED]) {
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    try {
      // Check if the emulators are running by checking the env vars.
      if (process.env.FIRESTORE_EMULATOR_HOST || process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
        console.log("Connecting to local Firebase emulators.");
        
        // Get the instances first
        const firestoreInstance = getFirestore(app);
        const authInstance = getAuth(app);
        
        // The SDK automatically detects the env vars on the server side.
        // We only need to explicitly connect on the client side.
        if (typeof window !== 'undefined') {
            connectFirestoreEmulator(firestoreInstance, 'localhost', 8080);
            connectAuthEmulator(authInstance, 'http://localhost:9099');
        }

        (global as any)[EMULATORS_STARTED] = true;
      } else {
        console.log("Firebase emulators not running or env vars not set. Skipping connection.");
      }
    } catch (e) {
      console.error("Error connecting to Firebase emulators:", e);
    }
  }
}

connectToEmulators();

db = getFirestore(app);
auth = getAuth(app);

export { db, auth };
