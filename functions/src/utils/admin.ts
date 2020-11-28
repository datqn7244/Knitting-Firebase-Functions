import * as admin from "firebase-admin";
import * as serviceAccount from "../utils/knitting-development.json";

admin.initializeApp({
  credential: admin.credential.cert(<any>serviceAccount),
  databaseURL: "https://knitting-development.firebaseio.com",
});

const db = admin.firestore();

export { admin, db };
