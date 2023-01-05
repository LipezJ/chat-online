import { socket } from "./public.js"

const data_ = {'user': localStorage.getItem('user'), 'pass': localStorage.getItem('pass')}
socket.emit('login', data_)
document.querySelector('#ownner').innerHTML = data_.user

const postReg = /[a-zA-z0-9\s.,:;-_"'!¡¿?()]/g

const post = (post, user) => {
    return `
    <div class="posts">
        <div class="owner">${user}:</div>
        <div class="post">${post}</div>
    </div>
    `
}
const chat = (user) => {
    return `
    <div class="chat">
        <div class="owner">${user}</div>
    </div>
    `
}

function send(e){
    let postm = document.querySelector('#posttext').value
    document.querySelector('#posttext').value = ''
    if (!postm.match(postReg)) return 0
    document.querySelector('#posts').innerHTML += post(postm, 'yo')
}
function enter(e){
    if (e.keyCode == 13) send(e)
}
function createChat(){
    document.querySelector('#chatsc').innerHTML += chat('Lopez')
}

document.querySelector('#createb').addEventListener('click', createChat)
document.querySelector('#sendb').addEventListener('click', send)
document.querySelector('#posttext').addEventListener('keyup', enter)