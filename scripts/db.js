import { db } from "./firebase/store.js"
import { getDoc, setDoc, doc, updateDoc, increment, arrayUnion, query, where, collection, getDocs } from "firebase/firestore"

// administar chats
async function createChat(name, user) {
    try {
        const data = {
            users: [user],
            pages: 0
        }
        await setDoc(doc(db, 'chats', name), {})
        await setDoc(doc(db, 'chatInfo', name), {})
        await updateDoc(doc(db, 'chatInfo', name), data)
    } catch (e) {
        console.log('error reading document: ', e)
    }
}
async function updateChat(name, lastPage, page) {
    try {
        await updateDoc(doc(db, 'chats', name), { [(page + 1)+'a']: lastPage })
        await updateDoc(doc(db, 'chatInfo', name), { 'pages': increment(1) })
    } catch (e) {
        console.log('error updating document: ', e)
    }
}
async function readChat(name, page) {
    try {
        const query = await getDoc(doc(db, 'chats', name))
        return query.data()[page+'a']
    } catch (e) {
        console.log('error reading document (readChat): ', e)
    }
}

//administrar usuarios
async function addUser(user, uid) {
    try {
        await updateDoc(doc(db, 'users', uid), {
            user,
            chats: ['global']
        })
        return true
    } catch (e) {
        console.log('error updating document: ', e)
        return null
    }
}
async function addUserChat(user, chat) {
    try {
        const queryUser = query(collection(db, 'users'), where('chatInfo', 'array-contains', user))
        if (queryUser) {
            await updateDoc(doc(db, 'users', user), {
                chats: arrayUnion(chat)
            })
            await updateDoc(doc(db, 'chatInfo', chat), {
                users: arrayUnion(user)
            })
            return true
        }
        return null
    } catch (e) {
        console.log('error updating document (addUserChat): ', e)
        return null
    }
}
async function updateUser(user, data) {
    try {
        await updateDoc(doc(db, 'users', user), data)
    } catch (e) {
        console.log('error updating document: ', e)
    }
}
async function readUser(user) {
    try {
        const query = await getDoc(doc(db, 'users', user))
        if (query.exists()) {
            return query.data()
        } else {
            return null
        }
    } catch (e) {
        console.log('error reading document: ', e)
        return null
    }
}
async function readUserChat(user, chat) {
    try {
        const queryUser = await getDoc(doc(db, 'users', user))
        const queryChat = await getDoc(doc(db, 'chatInfo', chat))
        if (queryUser.exists() && queryChat.exists()) {
            return {user: queryUser.data(), chat: queryChat.data()}
        } else {
            return {user: null, chat: null}
        }
    } catch (e) {
        console.log('error reading document: ', e)
        return {user: null, chat: null}
    }
}

export { createChat, updateChat, readChat, addUser, addUserChat, updateUser, readUser, readUserChat }