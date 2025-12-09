import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBi7MH1D7uXDpY-t0aUdJx5adRjR8NRavc",
  authDomain: "healthroute-768d4.firebaseapp.com",
  projectId: "healthroute-768d4",
  storageBucket: "healthroute-768d4.firebasestorage.app",
  messagingSenderId: "87125379154",
  appId: "1:87125379154:web:9bf41e31e4926690def78b"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
