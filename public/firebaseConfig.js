// Importando os módulos necessários do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCvBpaefejjMNPTN_A-yV5s6F0_okQFJZk",
  authDomain: "capsuladotempo-9d755.firebaseapp.com",
  projectId: "capsuladotempo-9d755",
  storageBucket: "capsuladotempo-9d755.appspot.com",
  messagingSenderId: "869092303974",
  appId: "1:869092303974:web:7d5b69c10147a178ddb9a7",
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Firebase Storage
export const storage = getStorage(app);
