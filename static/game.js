var socket = io();
var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}
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
setInterval(function () {
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
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }
    context.fillStyle = 'red';
    for (var id in data['bullets']) {
        var bullet = data['bullets'][id];
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        context.fill();
    }
});
