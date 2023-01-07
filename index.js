import express from "express";
import { Server } from "socket.io";
import http from "http"
import path from "path";
import { login, singup, joinReq, createReq, sendReq, logout } from './scripts/functions.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

// app.use(express.static('public'))
// app.get('/', (req, res) => {
//   res.sendFile(path.join(process.cwd(), '/public/login.html'))
// })
// app.get('/chat', (req, res) => {
//   res.sendFile(path.join(process.cwd(), '/public/chat.html'))
// })

io.on("connection", (socket) => {
  console.log(socket.id)
  socket.on('login', (data) => login(data, socket))
  socket.on('singup', (data) => singup(data, socket))
  socket.on('logout', e => logout(socket))
  socket.on('disconnect', e => logout(socket))

  socket.on('joinReq', (data) => joinReq(data, socket))
  socket.on('createReq', (data) => createReq(data, socket))
  socket.on('sendReq', (data) => sendReq(data, socket, io))
});

// setInterval(() => {
//   console.log(io.sockets.adapter.rooms)
// }, 15000)

console.log("4000")
server.listen(4000);