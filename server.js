// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();
let server = http.Server(app);
let io = socketIO(server);
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

let players = {};
let bullets = {};
io.on('connection', function (socket) {
    socket.on('new player', function (data) {
        players[socket.id] = {
            map: Math.floor(Math.random() * 2) + 1,
            x: Math.floor(Math.random() * 400) + 200,
            y: Math.floor(Math.random() * 400) + 100,
            direction: 'e',
            nick: data
        };
    });
    socket.on('movement', function (data) {
        let player = players[socket.id] || {};
        if (data.left && player.x > 3) {
            player.x -= 3;
        }
        else if (player.x <= 3 && player.map === 2) {
            player.map = 1;
            player.x = 760;
            player.y = 385;
        }
        if (data.up && player.y > 3) {
            player.y -= 3;
        }
        if (data.right && player.x < 765) {
            player.x += 3;
        }
        else if (player.x >= 765 && player.map === 1) {
            player.map = 2;
            player.x = 8;
            player.y = 220;
        }
        if (data.down && player.y < 560) {
            player.y += 3;
        }
    });
    socket.on('shoot', function (data) {
        let player = players[socket.id];
        if (player) {
            bullets[socket.id] = {
                shooter: socket.id,
                map: player.map,
                x: player.x+37,
                y: player.y+25,
                vx: data.x - player.x - 37,
                vy: data.y - player.y - 25
            };
            let vx = bullets[socket.id].vx;
            let vy = bullets[socket.id].vy;
            let deg = Math.atan2(vy, vx) * (180 / Math.PI);
            if (deg > -65 && deg < -15)
                player.direction = 'ne';
            if (deg > -15 && deg < 35)
                player.direction = 'e';
            if (deg > 35 && deg < 75)
                player.direction = 'se';
            if (deg > 75 && deg < 105)
                player.direction = 's';
            if (deg > 105 && deg < 150)
                player.direction = 'sw';
            if (deg > 150 && deg > -190)
                player.direction = 'w';
            if (deg > -190 && deg < -100)
                player.direction = 'nw';
            if (deg > -100 && deg < -65)
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
    for (let id in bullets) {
        let bullet = bullets[id];
        let vAbs = Math.sqrt(Math.pow(bullet.vx, 2) + Math.pow(bullet.vy, 2));
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
