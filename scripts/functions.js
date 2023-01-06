import { readFile, writeFile } from "fs/promises";

const emailReg = /^[a-zA-Z0-9.-_]+@[a-zA-Z0-9.-_]+\.(com|co|edu)+$/gm

const filesrc = ['./data/posts.json', './data/users.json']
let filem = await readFile(filesrc[0], 'utf-8')
let fileu = await readFile(filesrc[1], 'utf-8')
let posts = JSON.parse(filem)
let users = JSON.parse(fileu)

function loginReq(data, socket) {
    console.log('loginReq', data)
    if (data.user in users && data.pass == users[data.user].pass) {
        console.log('ha iniciado sesion', data.user)
        socket.emit('loginSucess', {user: data.user})
    } else socket.emit('alert', {ms: 'login error'})
}
function singupReq(data, socket) {
    console.log('singupReq', data)
    console.log(!(data.user in users), data.pass, data.email.match(emailReg))
    if (!(data.user in users) && data.pass && data.email.match(emailReg)) {
        users[data.user] = {pass: data.pass, logued: false}
        loginReq({user: data.user, pass: data.pass}, socket)
    } else socket.emit('alert', {ms: 'singup error'})
}
function joinReq(data, socket) {
    console.log('joinReq', posts)
    if (data.chat in posts && data.user in users) {
        console.log(!(data.user in posts[data.chat].users))
        if (!(data.user in posts[data.chat].users)) posts[data.chat].users.push(data.user)
        socket.join(data.chat)
        socket.emit('joinSucess', posts[data.chat])
    } else socket.emit('alert', {ms: 'join error'})
}
function createReq(data, socket) {
    console.log('createReq', data)
    if (data.chat.length > 5 && !(data.chat in posts) && data.user in users) {
        posts[data.chat] = {users:[], posts:{}}
        joinReq(data, socket)
    } else socket.emit('alert', {ms: 'create error'})
}

function sendReq(data, socket, io) {
    console.log('sendReq')
    if (data.user in users && data.chat in posts) {
        let today = new Date()
        let now = today.getTime().toString()
        console.log('se envio un mensaje', data)
        posts[data.chat].posts[data.chat + now] = {user: data.user, post: data.post}
        io.to(data.chat).emit('sendSucess', data)
    } else socket.emit('alert', {ms: 'send error'})
}

setInterval(() => {
    console.log(posts)
}, 5000)

export { loginReq, singupReq, joinReq, createReq, sendReq }