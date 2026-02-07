import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object

const firebaseConfig = {
  apiKey: "AIzaSyBjFIrtiiiCXQxMoo1JNPlQj2gYUivDikc",
  authDomain: "uhax-2026.firebaseapp.com",
  projectId: "uhax-2026",
  storageBucket: "uhax-2026.firebasestorage.app",
  messagingSenderId: "3858562398",
  appId: "1:3858562398:web:8e59629d5f63f81ce263cf",
  measurementId: "G-605GJFM2KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
// Use persistentLocalCache without tab manager to avoid Electron/IndexedDB sync issues
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

export default app;
