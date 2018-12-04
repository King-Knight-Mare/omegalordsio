// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var server = http.Server(app);
var port = process.env.PORT || 5000;
var socketIO = require('socket.io');
var io = socketIO(server);
var favicon = require('serve-favicon')
var game = require("./Entity.js")
new game(io.of('/game'), '/game');
Math = require('./math.js')
var Vector = require('./Vector.js')
// Aliases
server.listen(
    process.env.PORT,
    function() {
        console.log('Your app is listening on port ' + server.address().port);
    }
)
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, '/client/index.html'));
});
app.set('port', port);
app.use('/client', express.static(__dirname + '/client'))
app.use(favicon(path.join(__dirname, '/client/img/favicon.ico')));
app.use(function(req, res, next) {
    res.status(404).sendFile(__dirname + '/404.html')
})

var adminList = [];
io.on('connection', function(socket) {
    var toJoin = global.games[0];
    io.to(socket.id).emit('game', toJoin.ns)
})