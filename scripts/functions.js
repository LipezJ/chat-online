import { readFile, writeFile  } from "fs/promises"
import { v1 as uuidv1 } from 'uuid'
import { app } from "./firebase/config.js"
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { addUser, readUser, createChat, addUserChat, readChat, updateChat, readUserChat } from "./db.js"

const filesrc = ['./data/posts.json', './data/sockets.json']
let filem = await readFile(filesrc[0], 'utf-8')
let files = await readFile(filesrc[1], 'utf-8')
let posts = JSON.parse(filem)
let sockets = JSON.parse(files)

const auth = getAuth(app)

async function login(data, socket) {
    signInWithEmailAndPassword(auth, data.email, data.pass)
    .then( async (userCredential) => {
        socket['token'] = userCredential.user.uid
        if (sockets[socket.token] !== '') {
            delete socket.token
            socket.emit('alert', {ms: 'ya ha iniciado sesion'})
            return 0
        }
        sockets[socket.token] = socket.id
        await readUser(socket.token).then((user) => {
            socket.emit('loginSucess', {user: user.user})
        })
    }).catch((err) => {socket.emit('alert', {ms: err})})
}
function singup(data, socket) {
    createUserWithEmailAndPassword(auth, data.email, data.pass)
    .then( async (userCredential) => {
        await addUser(data.user, userCredential.user.uid).then(async (sucess) => {
            if (sucess) {
                socket['token'] = userCredential.user.uid
                sockets[socket.token] = socket.id
                socket.emit('loginSucess', {user: data.user})
                await writeFile(filesrc[1], JSON.stringify(sockets))
            } else {
                socket.emit('alert', {ms: 'create user error'})
            }
        })
    }).catch((err) => socket.emit('alert', {ms: err}))
}
function logout(socket) {
    if (socket.token) {
        signOut(auth).then(async () => {
            sockets[socket.token] = ''
            delete socket.token
            await writeFile(filesrc[1], JSON.stringify(sockets))
        })
    }
}

async function createReq(data, socket) {
    if (data.chat.length > 5 && !(data.chat in posts) && socket.token) {
        posts[data.chat] = {lastPage:{}, postLast: 0, pages: 0}
        await createChat(data.chat).then(() => {
            joinReq(data, socket)
        })
    } else socket.emit('alert', {ms: 'create error'})
}
async function joinReq(data, socket) {
    socket.leaveAll()
    delete socket.lastPage
    if (data.chat in posts && socket.token) {
        await readUserChat(socket.token, data.chat).then(async ({user, chat}) => {
            if (!user || !chat) return null
            socket.join(data.chat)
            socket['lastPage'] = chat.pages - 1
            let postSend = posts[data.chat].lastPage
            if (chat.pages > 0) {
                await readChat(data.chat, chat.pages-1).then(page => {
                    postSend = {...page, ...postSend}
                    socket.lastPage --
                })
            }
            await addUserChat(socket.token, data.chat).then(async new_ => {
                socket.emit('joinSucess', {posts: postSend, chat: data.chat, new: new_})
                await writeFile(filesrc[1], JSON.stringify(sockets))
            })
        })
    } else socket.emit('alert', {ms: 'join error'})
}
async function addChat(data, socket) {
    await readUser(socket.token).then(user => {
        if (user.chats.indexOf(data.chat) < 0 && data.chat in posts && socket.token) {
            addUserChat(socket.token, data.chat)
        }
    })
}
async function updateChats(socket) {
    if (socket.token) {
        await readUser(socket.token).then(user => {
            socket.emit('updateChatsSucess', {chats: user.chats}) 
        })
    }
}

async function sendReq(data, socket, io) {
    if (socket.token && data.chat in posts) {
        posts[data.chat].lastPage[uuidv1()] = {user: data.user, post: data.post, date: data.date}
        io.to(data.chat).emit('sendSucess', data)
        if (posts[data.chat].postLast > 30) {
            updateChat(data.chat, posts[data.chat].lastPage, posts[data.chat].pages)
            posts[data.chat].postLast = 0
            posts[data.chat].lastPage = {}
            posts[data.chat].pages ++
            await writeFile(filesrc[0], JSON.stringify(posts))
        }
        posts[data.chat].postLast ++
    } else socket.emit('alert', {ms: 'send error'})
}
function nextPage(socket, data) {
    if (socket.lastPage >= 0) {
        readChat(data.chat, socket.lastPage).then(chat => {
            socket.emit('sendPage', chat)
        })
        socket.lastPage --
    }
}

export { login, singup, logout, joinReq, createReq, sendReq, nextPage, addChat, updateChats }