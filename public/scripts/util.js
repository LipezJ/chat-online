import { socket } from "./public.js"

let name = ' '

export const islogued = (data) => alert('ya ha iniciado sesion')

export function mensaje(data) {
    document.querySelector('#mensajes').innerHTML += `
    <div class="mensaje">
        ${data.name.match(RegExp(name, 'g')) ? 'Yo': 'Anonimo'}: ${data.ms} 
    </div>
    `
}

export function enviar() {
    let ms = document.querySelector('#input').value
    socket.emit('send', {mensaje: ms})
    document.querySelector('#input').value = ''
}

export function login() {
    let user = document.querySelector('#useri').value
    let pass = document.querySelector('#passi').value
    socket.emit('usuario', {name: user, pass: pass})
}

export function sucessfull(data) {
    name = data.name
    document.querySelector('#mensajes').innerHTML = ''
    socket.emit('actualizar', {})
    document.querySelector('#loginf').style.display = 'none'
}