import { readFile, writeFile  } from "fs/promises";
import { v4 as uuidv4 } from 'uuid'
import { app } from "./firebase/config.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const filesrc = ['./data/posts.json', './data/sockets.json']
let filem = await readFile(filesrc[0], 'utf-8')
let files = await readFile(filesrc[1], 'utf-8')
let posts = JSON.parse(filem)
let sockets = JSON.parse(files)

const auth = getAuth(app)

function login(data, socket) {
    signInWithEmailAndPassword(auth, data.email, data.pass)
    .then( async (userCredential) => {
        socket['token'] = userCredential.user.uid
        if (sockets[socket.token].socket !== '') {
            delete socket.token
            socket.emit('alert', {ms: 'ya ha iniciado sesion'})
            return 0
        }
        sockets[socket.token].socket = socket.id
        socket.emit('loginSucess', {user: sockets[socket.token].user})
        await writeFile(filesrc[1], JSON.stringify(sockets))
    }).catch((err) => {socket.emit('alert', {ms: err})})
}
function singup(data, socket) {
    createUserWithEmailAndPassword(auth, data.email, data.pass)
    .then( async (userCredential) => {
        socket['token'] = userCredential.user.uid
        sockets[socket.token] = {user: data.user, socket: socket.id, chats: ['global']}
        socket.emit('loginSucess', {user: data.user})
        await writeFile(filesrc[1], JSON.stringify(sockets))
    }).catch((err) => socket.emit('alert', {ms: err}))
}
function logout(socket) {
    if (socket.token) {
        signOut(auth).then(async () => {
            sockets[socket.token].socket = ''
            delete socket.token
            await writeFile(filesrc[1], JSON.stringify(sockets))
        })
    }
}

function createReq(data, socket) {
    if (data.chat.length > 5 && !(data.chat in posts) && socket.token) {
        posts[data.chat] = {users:[], posts:[{}], pages:0, postLast: 0}
        joinReq(data, socket)
    } else socket.emit('alert', {ms: 'create error'})
}
async function joinReq(data, socket) {
    socket.leaveAll()
    delete socket.lastPage
    if (data.chat in posts && socket.token) {
        if (posts[data.chat].users.indexOf(sockets[socket.token].user) < 0) {
            posts[data.chat].users.push(sockets[socket.token].user)
        }
        socket.join(data.chat)
        socket['lastPage'] = 
            posts[data.chat].pages > 0
                ? posts[data.chat].pages - 2
                : posts[data.chat].pages - 1
        let new_ = sockets[socket.token].chats.indexOf(data.chat) < 0
        let postSend =
            posts[data.chat].pages > 0
                ? {
                      ...posts[data.chat].posts[posts[data.chat].pages - 1],
                      ...posts[data.chat].posts[posts[data.chat].pages],
                  }
                : posts[data.chat].posts[posts[data.chat].pages];
        socket.emit('joinSucess', {posts: postSend, chat: data.chat, new: new_})
        await writeFile(filesrc[1], JSON.stringify(sockets))
    } else socket.emit('alert', {ms: 'join error'})
}
function addChat(data, socket) {
    if (sockets[socket.token].chats.indexOf(data.chat) < 0 && data.chat in posts && socket.token) {
        sockets[socket.token].chats.push(data.chat)
    }
}
function updateChats(socket) {
    if (socket.token) {
        socket.emit('updateChatsSucess', {chats: sockets[socket.token].chats}) 
    }
}

async function sendReq(data, socket, io) {
    if (socket.token && data.chat in posts) {
        if (posts[data.chat].postLast > 30) {
            posts[data.chat].pages ++
            posts[data.chat].postLast = 0
            posts[data.chat].posts.push({})
            await writeFile(filesrc[0], JSON.stringify(posts))
        }
        posts[data.chat].postLast ++
        posts[data.chat].posts[posts[data.chat].pages][uuidv4()] = {user: data.user, post: data.post, date: data.date}
        io.to(data.chat).emit('sendSucess', data)
    } else socket.emit('alert', {ms: 'send error'})
}
function nextPage(socket, data) {
    if (socket.lastPage >= 0) {
        socket.emit('sendPage', posts[data.chat].posts[socket.lastPage])
        socket.lastPage --
    }
}

export { login, singup, logout, joinReq, createReq, sendReq, nextPage, addChat, updateChats }