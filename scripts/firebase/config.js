import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyCJZNJ5DtzsiTuDxcQeJ3Vto309F4AIVPE",
  authDomain: "chat-online-auth.firebaseapp.com",
  projectId: "chat-online-auth",
  storageBucket: "chat-online-auth.appspot.com",
  messagingSenderId: "179291582285",
  appId: "1:179291582285:web:e973d43e4b753e8eea5104"
};

const app = initializeApp(firebaseConfig);

export {app}