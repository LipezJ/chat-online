function switchModo(){
    let modo = document.querySelector('.singup').style.display
    modo = modo == '' || modo == 'none' ? 'block' : 'none'
    document.querySelectorAll('.singup').forEach((i) => i.style.display = modo)
    document.querySelector('#title').innerHTML = modo == 'none' ? 'Login' : 'Sing up'
    document.querySelector('#switch').innerHTML = modo != 'none' ? 'Login' : 'Sing up'
    document.querySelector('#loginb').style.display = modo == 'block' ? 'none' : 'block'
    document.querySelector(modo != 'none' ? '#loginb' : '#singupb').removeEventListener('click', LoginReg)
    document.querySelector(modo == 'none' ? '#loginb' : '#singupb').addEventListener('click', LoginReg)
}

function LoginReg(e) {
    let data = {}
    data['user'] = document.querySelector('#useri').value
    data['pass'] = document.querySelector('#passi').value
    if (e.target.innerHTML == 'Sing up') {
        data['email'] = document.querySelector('#emaili').value
    }
    console.log(data)
}

document.querySelector('#switch').addEventListener('click', switchModo)
document.querySelector('#loginb').addEventListener('click', LoginReg)