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
            y: 300
        };
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 5;
        }
        if (data.up) {
            player.y -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (data.down) {
            player.y += 5;
        }
    });
    socket.on('shoot', function (data) {
        var player = players[socket.id] || {};
        bullets[socket.id] = {
            shooter: socket.id,
            x: player.x,
            y: player.y,
            vx: data.x - player.x,
            vy: data.y - player.y
        };
    });
    socket.on('disconnect', function () {
        delete players[socket.id];
    });
});
setInterval(function () {
    for (var id in bullets) {
        var bullet = bullets[id];
        var vAbs = Math.sqrt(Math.pow(bullet.vx, 2) + Math.pow(bullet.vy, 2));
        if (vAbs > 7) {
            bullet.vx *= (1 / vAbs) * 7;
            bullet.vy *= (1 / vAbs) * 7;
        }
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        // check collisions
        for (var id in players) {
            var player = players[id];
            var dist = Math.sqrt(Math.pow(player.x - bullet.x, 2) + Math.pow(player.y - bullet.y, 2));
            if (dist < 15 && id != bullet.shooter)
                delete players[id];
        }
    }
    io.sockets.emit('state', {'players': players, 'bullets': bullets});
}, 1000 / 60);
