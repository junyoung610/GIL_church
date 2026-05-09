import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbz5cKl1_NUJhcrShvH5FKWMJGGQfhbWY",
  authDomain: "gil-church.firebaseapp.com",
  projectId: "gil-church",
  storageBucket: "gil-church.firebasestorage.app",
  messagingSenderId: "701633933270",
  appId: "1:701633933270:web:9be2ad51c0b3b22c90fe77",
  measurementId: "G-68ZP95S20G",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 추가하여 내보내기
