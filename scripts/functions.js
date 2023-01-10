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

async function login(data, socket) {
    console.log(data)
    signInWithEmailAndPassword(auth, data.email, data.pass)
    .then((userCredential) => {
        socket['token'] = userCredential.user.uid
        if (sockets[socket.token].socket !== '') {
            socket.emit('alert', {ms: 'ya ha iniciado sesion'})
            return 0
        }
        sockets[socket.token].socket = socket.id
        console.log(sockets[socket.token].user)
        socket.emit('loginSucess', {user: sockets[socket.token].user})
    }).catch((err) => {socket.emit('alert', {ms: err}); console.log(err)})
    await writeFile(filesrc[1], JSON.stringify(sockets))
}
async function singup(data, socket) {
    createUserWithEmailAndPassword(auth, data.email, data.pass)
    .then((userCredential) => {
        socket['token'] = userCredential.user.uid
        sockets[data.token] = {user: data.user, socket: socket.id}
        socket.emit('loginSucess', {user: data.user})
    }).catch((err) => socket.emit('alert', {ms: 'sing up error'}))
    await writeFile(filesrc[1], JSON.stringify(sockets))
}
async function logout(socket) {
    if (socket.token) {
        signOut(auth).then(() => {
            sockets[socket.token].socket = ''
            delete socket.token
        })
        await writeFile(filesrc[1], JSON.stringify(sockets))
    }
}

function createReq(data, socket) {
    console.log('createReq', data)
    if (data.chat.length > 5 && !(data.chat in posts) && socket.token) {
        posts[data.chat] = {users:[], posts:[{}], pages:0, postLast: 0}
        joinReq(data, socket)
    } else socket.emit('alert', {ms: 'create error'})
}
function joinReq(data, socket) {
    console.log('joinReq', posts)
    socket.leaveAll()
    delete socket.lastPage
    if (data.chat in posts && socket.token) {
        if (posts[data.chat].users.indexOf(sockets[socket.token].user) < 0) {
            posts[data.chat].users.push(sockets[socket.token].user)
        }
        socket.join(data.chat)
        socket['lastPage'] = posts[data.chat].pages - 1
        console.log("enviando", posts[data.chat].posts[posts[data.chat].pages])
        socket.emit('joinSucess', posts[data.chat].posts[posts[data.chat].pages])
    } else socket.emit('alert', {ms: 'join error'})
}

function sendReq(data, socket, io) {
    console.log('sendReq')
    if (socket.token && data.chat in posts) {
        if (posts[data.chat].postLast > 30) {
            posts[data.chat].pages ++
            posts[data.chat].postLast = 0
            posts[data.chat].posts.push({})
        }
        posts[data.chat].postLast ++
        console.log(posts[data.chat].posts[posts[data.chat].pages],posts[data.chat])
        posts[data.chat].posts[posts[data.chat].pages][Date.now()] = {user: data.user, post: data.post}
        io.to(data.chat).emit('sendSucess', data)
    } else socket.emit('alert', {ms: 'send error'})
}
function nextPage(socket, data) {
    if (socket.lastPage >= 0) {
        socket.emit('sendPage', posts[data.chat].posts[socket.lastPage])
        socket.lastPage --
        console.log(posts[data.chat].posts[posts[socket.lastPage]])
    }
}

 setInterval(() => {
     console.log(posts)
}, 10000)

export { login, singup, logout, joinReq, createReq, sendReq, nextPage }