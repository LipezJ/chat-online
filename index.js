import express from "express";
import { Server } from "socket.io";
import http from "http"
import path from "path";
import { loginReq, singupReq, joinReq, createReq, sendReq, dSocket } from './scripts/functions.js'

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
  socket.on('loginReq', (data) => loginReq(data, socket))
  socket.on('singupReq', (data) => singupReq(data, socket))
  socket.on('joinReq', (data) => joinReq(data, socket))
  socket.on('createReq', (data) => createReq(data, socket))
  socket.on('sendReq', (data) => sendReq(data, socket, io))
  socket.on('dSocket', e => dSocket(socket))
  socket.on('disconnect', e => dSocket(socket))
});

// setInterval(() => {
//   console.log(io.sockets.adapter.rooms)
// }, 15000)

console.log("4000")
server.listen(4000);