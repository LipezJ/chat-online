import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import { enviar, mensaje, login, sucessfull, islogued } from "./util.js"

export const socket = io("http://127.0.0.1:3000", { transports : ['websocket'] });

socket.on('mensaje', (data) => mensaje(data))
socket.on('sucessfull', (data) => sucessfull(data))
socket.on('islogued', (data) => islogued(data))

socket.emit('actualizar', {})

document.querySelector('#enviar').addEventListener('click', e => enviar())
document.querySelector('#login').addEventListener('click', e => login())