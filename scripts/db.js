import { db } from "./firebase/store.js"
import { getDoc, setDoc, doc, updateDoc, increment, arrayUnion, query, where, collection } from "firebase/firestore"

// administar chats
async function createChat(name, user) {
    try {
        await setDoc(doc(db, 'chats', name), {})
        await setDoc(doc(db, 'chatInfo', name), {}).then(async () => {
            await updateDoc(doc(db, 'chatInfo', name), {
                pages: 0,
                users: []
            })
        })
    } catch (e) {
        console.log('error reading document: ', e)
    }
}
async function updateChat(name, lastPage, pages) {
    try {
        updateDoc(doc(db, 'chats', name), {
            [pages+'a']: lastPage
        })
        updateDoc(doc(db, 'chatInfo', name), {
            pages: increment(1)
        })
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
        await setDoc(doc(db, 'users', uid), {
            user,
            chats: ['global']
        })
        return true
    } catch (e) {
        console.log('error updating document (addUser): ', e)
        return true
    }
}
async function addUserChat(user_, chat) {
    try {
        const r = await readUser(user_).then(async user => {
            if (!(chat in user.chats)) {
                await updateDoc(doc(db, 'users', user_), {
                    chats: arrayUnion(chat)
                })
                await updateDoc(doc(db, 'chatInfo', chat), {
                    users: arrayUnion(user_)
                })
                return false
            }
            return true
        })
        return r
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