import express from "express";
import { Server } from "socket.io";
import http from "http"
import path from "path";
import { login, singup, joinReq, createReq, sendReq, logout, nextPage, addChat, updateChats } from './scripts/functions.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static('build'))
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/build/index.html'))
})

io.on("connection", (socket) => {
  socket.on('login', (data) => login(data, socket))
  socket.on('singup', (data) => singup(data, socket))
  socket.on('logout', e => logout(socket))
  socket.on('disconnect', e => logout(socket))

  socket.on('joinReq', (data) => joinReq(data, socket))
  socket.on('createReq', (data) => createReq(data, socket))
  socket.on('addChats', (data) => addChat(data, socket))
  socket.on('updateChats', (data) => updateChats(socket))
  socket.on('sendReq', (data) => sendReq(data, socket, io))
  socket.on('nextPage', (data) => nextPage(socket, data))
});

console.log(process.env.PORT || 4000)
server.listen(process.env.PORT || 4000);