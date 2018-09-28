let socket = io();

let movement = {
    up: false,
    down: false,
    left: false,
    right: false
};

let myNick;
while (!myNick)
    myNick = window.prompt("Enter your nickname:");

document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});

document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

document.addEventListener('click', function (event) {
    socket.emit('shoot', {'x': event.clientX, 'y': event.clientY});
});

socket.emit('new player', myNick);
let moveInterval = setInterval(function () {
    socket.emit('movement', movement);
}, 1000 / 60);
let canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
let context = canvas.getContext('2d');
context.font = '14px David';
socket.on('state', function (data) {
    let id;
    context.clearRect(0, 0, 800, 600);
    for (id in data['players']) {
        let player = data['players'][id];
        let me = data['players'][socket.id];
        if (me && player.map === data['players'][socket.id].map) {
            let img = playerImage('n');
            switch (player.direction) {
                case 'n':
                    break;
                case 'ne':
                    img = playerImage('ne');
                    break;
                case 'e':
                    img = playerImage('e');
                    break;
                case 'se':
                    img = playerImage('se');
                    break;
                case 's':
                    img = playerImage('s');
                    break;
                case 'sw':
                    img = playerImage('sw');
                    break;
                case 'w':
                    img = playerImage('w');
                    break;
                case 'nw':
                    img = playerImage('nw');
                    break;
            }
            canvas.style.backgroundImage = 'url("static/map/' + me.map + '.jpg")';
            context.drawImage(img, player.x, player.y);
            context.fillStyle = 'red';
            if (id === socket.id)
                context.fillStyle = 'green';
            context.fillText(player.nick, player.x + 15, player.y);
        }
    }
    context.fillStyle = 'red';
    for (id in data['bullets']) {
        let bullet = data['bullets'][id];
        let me = data['players'][socket.id];
        if (me && bullet.map === me.map) {
            context.beginPath();
            context.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
            context.fill();
            let dist = Math.sqrt(Math.pow(me.x + 37 - bullet.x, 2) + Math.pow(me.y + 25 - bullet.y, 2));
            if (dist < 50 && socket.id !== bullet.shooter) {
                socket.emit('player killed', data['players'][bullet.shooter].nick);
                clearInterval(moveInterval);
                movement.left = false;
                movement.right = false;
                movement.down = false;
                movement.up = false;
                alert("You were killed by " + data['players'][bullet.shooter].nick + ". Press OK to respawn");
                socket.emit('new player', myNick); // fixme kill is still weird
                moveInterval = setInterval(function () {
                    socket.emit('movement', movement);
                }, 1000 / 60);
                break;
            }
        }
    }
    let scoreH = document.getElementById('scores');
    scoreH.innerHTML = "";
    for (let nick in data['scores'])
        scoreH.innerHTML += nick + ": " + data['scores'][nick] + "<br>";

});
