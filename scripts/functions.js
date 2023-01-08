import { readFile, writeFile  } from "fs/promises";
import { v4 as uuidv4 } from 'uuid'

const filesrc = ['./data/posts.json', './data/sockets.json']
let filem = await readFile(filesrc[0], 'utf-8')
let files = await readFile(filesrc[1], 'utf-8')
let posts = JSON.parse(filem)
let sockets = JSON.parse(files)

async function login(data, socket) {
    console.log(data)
    socket['token'] = data.token
    if (sockets[socket.token].socket !== '') {
        socket.emit('alert', {ms: 'ya ha iniciado sesion'})
        return 0
    }
    sockets[data.token].socket = socket.id
    socket.emit('loginSucess', {user: sockets[data.token].user})
    await writeFile(filesrc[1], JSON.stringify(sockets))
}
async function singup(data, socket) {
    socket['token'] = data.token
    sockets[data.token] = {user: data.user, socket: socket.id}
    socket.emit('loginSucess', {user: data.user})
    await writeFile(filesrc[1], JSON.stringify(sockets))
}
async function logout(socket) {
    if (socket.token) {
        sockets[socket.token].socket = ''
        delete socket.token
        await writeFile(filesrc[1], JSON.stringify(sockets))
    }
}

function createReq(data, socket) {
    console.log('createReq', data)
    if (data.chat.length > 5 && !(data.chat in posts) && socket.token) {
        posts[data.chat] = {users:[], posts:{}}
        joinReq(data, socket)
    } else socket.emit('alert', {ms: 'create error'})
}
function joinReq(data, socket) {
    console.log('joinReq', posts)
    socket.leaveAll()
    if (data.chat in posts && socket.token) {
        if (posts[data.chat].users.indexOf(sockets[socket.token].user) < 0) {
            posts[data.chat].users.push(sockets[socket.token].user)
        }
        socket.join(data.chat)
        socket.emit('joinSucess', posts[data.chat])
    } else socket.emit('alert', {ms: 'join error'})
}

function sendReq(data, socket, io) {
    console.log('sendReq')
    if (socket.token && data.chat in posts) {
        console.log('se envio un mensaje', data)
        posts[data.chat].posts[uuidv4()] = {user: data.user, post: data.post}
        io.to(data.chat).emit('sendSucess', data)
    } else socket.emit('alert', {ms: 'send error'})
}

// setInterval(() => {
//     console.log(posts, sockets)
// }, 15000)

export { login, singup, logout, joinReq, createReq, sendReq }