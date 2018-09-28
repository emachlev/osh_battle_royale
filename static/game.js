var socket = io();
var movement = {
    up: false,
    down: false,
    left: false,
    right: false
};
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
socket.emit('new player');
var moveInterval = setInterval(function () {
    socket.emit('movement', movement);
}, 1000 / 60);
var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
var context = canvas.getContext('2d');
socket.on('state', function (data) {
    context.clearRect(0, 0, 800, 600);
    context.fillStyle = 'green';
    for (var id in data['players']) {
        var player = data['players'][id];
        var img = playerImage('n');
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
        context.drawImage(img, player.x, player.y);
    }
    context.fillStyle = 'red';
    for (var id in data['bullets']) {
        var bullet = data['bullets'][id];
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        context.fill();
        var me = data['players'][socket.id];
        var dist = Math.sqrt(Math.pow(me.x+37 - bullet.x, 2) + Math.pow(me.y+25 - bullet.y, 2));
        if (dist < 60 && socket.id != bullet.shooter) {
            socket.emit('remove player'); // fixme kill is weird
            clearInterval(moveInterval);
            if (confirm("You were killed. Respawn?"))
                location.reload();
        }
    }
});
