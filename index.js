import express from "express";
import { Server } from "socket.io";
import http from "http"
import { readFile, writeFile } from "fs/promises";
import path from "path";

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const filesrc = ['./data/posts.json', './data/users.json']
let filem = await readFile(filesrc[0], 'utf-8')
let fileu = await readFile(filesrc[1], 'utf-8')
let posts = JSON.parse(filem)
let users = JSON.parse(fileu)

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/public/login.html'))
})
app.get('/chat', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/public/chat.html'))
})

io.on("connection", (socket) => {
  console.log(socket.id)
  socket.on('LoginTest', async (data) => {
    if (data.user in users && data.pass == users[data.user].pass && !users[data.user].logued) {
      users[data.user].logued = true
      socket.emit('loginSucessfull', data)
      await writeFile(filesrc[1], JSON.stringify(users))
    }
  })
  socket.on('login', (data) => {
    if (data.user in users && data.pass == users[data.user].pass && users[data.user].logued) {
      console.log('ha iniciado sesion!')
    }
  })
});

console.log("3000")
server.listen(3000);