// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});

var players = {};
var bullets = {};
io.on('connection', function (socket) {
    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 300,
            direction: 'e'
        };
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 3;
        }
        if (data.up) {
            player.y -= 3;
        }
        if (data.right) {
            player.x += 3;
        }
        if (data.down) {
            player.y += 3;
        }
    });
    socket.on('shoot', function (data) {
        var player = players[socket.id];
        if (player) {
            bullets[socket.id] = {
                shooter: socket.id,
                x: player.x+37,
                y: player.y+25,
                vx: data.x - player.x,
                vy: data.y - player.y
            };
            var vx = bullets[socket.id].vx;
            var vy = bullets[socket.id].vy;
            var deg = Math.atan2(vy, vx) * (180/Math.PI);
            if (deg > -65 && deg < -35)
                player.direction = 'ne';
            if (deg > -35 && deg < 35)
                player.direction = 'e';
            if (deg > 35 && deg < 75)
                player.direction = 'se';
            if (deg > 75 && deg < 105)
                player.direction = 's';
            if (deg > 105 && deg < 150)
                player.direction = 'sw';
            if (deg > 150 && deg > -190)
                player.direction = 'w';
            if (deg > -190 && deg < -120)
                player.direction = 'nw';
            if (deg > -120 && deg < -65)
                player.direction = 'n';

        }
    });
    socket.on('player killed', function () {
        delete players[socket.id];
        delete bullets[socket.id];
    });
    socket.on('disconnect', function () {
        delete players[socket.id];
    });
});
setInterval(function () {
    for (var id in bullets) {
        var bullet = bullets[id];
        var vAbs = Math.sqrt(Math.pow(bullet.vx, 2) + Math.pow(bullet.vy, 2));
        if (vAbs > 14) {
            bullet.vx *= (1 / vAbs) * 14;
            bullet.vy *= (1 / vAbs) * 14;
        }
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        if (bullet.x  > 800 || bullet.x < 0 || bullet.y > 600 || bullet.y < 0)
            delete bullets[id];
    }
    io.sockets.emit('state', {'players': players, 'bullets': bullets});
}, 1000 / 60);
