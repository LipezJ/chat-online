import express, { json } from "express";
import { Server } from "socket.io";
import http from "http"
import { readFile, writeFile } from "fs/promises";
import path from "path";

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const filesrc = ['./data/mensajes.json', './data/usuarios.json']
let filem = await readFile(filesrc[0], 'utf-8')
let fileu = await readFile(filesrc[1], 'utf-8')
let mensajes = JSON.parse(filem)
let usuarios = JSON.parse(fileu)

app.use(express.static('public'))
app.get('/chat', (req, res) => {
  res.sendFile(path.join(process.cwd(), '/public/index.html'))
})

io.on("connection", (socket) => {
  console.log(socket.id)

  socket.on('send', async (data) => {
    let today = new Date()
    let now = today.getTime()
    console.log(socket.id + now)
    mensajes[socket.id + now] = data.mensaje
    await writeFile(filesrc[0], JSON.stringify(mensajes))
    io.emit('mensaje', {name: socket.id + now, ms: data.mensaje})
  })
  socket.on('actualizar', (data) => {
    Object.keys(mensajes).forEach((mensaje) => {
      socket.emit('mensaje', {name: mensaje, ms: mensajes[mensaje]})
    })
  })
  socket.on('usuario', (data) => {
    console.log(usuarios[data.name].logued)
    if (Object.keys(usuarios).indexOf(data.name) >= 0 && data.pass == usuarios[data.name].pass && !usuarios[data.name].logued) {
      socket.id = data.name
      usuarios[data.name].logued = true
      socket.emit('sucessfull', {name: data.name})
      console.log(data.name, 'ha iniciado sesion!')
    } else if (usuarios[data.name].logued) {
      socket.emit('islogued', {})
    }
    else {
      console.log('usuario desconocido!')
    }
  })
});

console.log("3000")
server.listen(3000);