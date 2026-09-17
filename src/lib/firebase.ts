import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * Configuração do Firebase (Realtime Database).
 * A apiKey do Firebase é uma chave pública de identificação do projeto
 * (a segurança real vem das regras do Realtime Database), então pode
 * ficar no código do cliente.
 */
const firebaseConfig = {
  apiKey: "J6DGmoEXCx1sE9QiiMxWmB2jjVsuoUPd0rDBZZOR",
  authDomain: "buber-ea9c1.firebaseapp.com",
  databaseURL: "https://buber-ea9c1-default-rtdb.firebaseio.com",
  projectId: "buber-ea9c1",
};

const app = initializeApp(firebaseConfig);

/** Instância do Realtime Database — alimentada pelo GPS NEO-6M + Arduino Mega. */
export const db = getDatabase(app);
