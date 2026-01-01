import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Masks Firebase Config
const masksConfig = {
  apiKey: "AIzaSyDsN45J6MZpCEpOoK8zoJFO1k984dYVXHQ",
  authDomain: "mask-manager.firebaseapp.com",
  projectId: "mask-manager",
  storageBucket: "mask-manager.firebasestorage.app",
  messagingSenderId: "28443423486",
  appId: "1:28443423486:web:10472b98aefc9465e86baf",
  measurementId: "G-WY63J5G481"
}

// Spools Firebase Config
const spoolsConfig = {
  apiKey: "AIzaSyBH0rLK0bi0zSkjI7fEhUCXoQfphRr-_Xg",
  authDomain: "reels4f.firebaseapp.com",
  projectId: "reels4f",
  storageBucket: "reels4f.firebasestorage.app",
  messagingSenderId: "646479694296",
  appId: "1:646479694296:web:160adcb14d32c6f8a20aad",
  measurementId: "G-M4YN1LGVNR"
}

// Initialize Firebase Apps
export const masksApp = initializeApp(masksConfig, 'masks')
export const spoolsApp = initializeApp(spoolsConfig, 'spools')

// Initialize Firestore
export const masksDb = getFirestore(masksApp)
export const spoolsDb = getFirestore(spoolsApp)

// Initialize Auth
export const masksAuth = getAuth(masksApp)
export const spoolsAuth = getAuth(spoolsApp)

// Enable offline persistence
try {
  enableIndexedDbPersistence(masksDb).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Masks: Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('Masks: The current browser does not support persistence.')
    }
  })
  
  enableIndexedDbPersistence(spoolsDb).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Spools: Multiple tabs open, persistence can only be enabled in one tab at a time.')
    } else if (err.code === 'unimplemented') {
      console.warn('Spools: The current browser does not support persistence.')
    }
  })
} catch (err) {
  console.error('Persistence error:', err)
}

