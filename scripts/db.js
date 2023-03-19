import { db } from "./firebase/store.js"
import { getDoc, doc } from "firebase/firestore"

async function readChat(name) {
    try {
        const query = await getDoc(doc(db, 'chats', 'global'));
        console.log(query.data())
        return query
    } catch (e) {
        console.log('error reading document: ', e)
    }
}

export { readChat }