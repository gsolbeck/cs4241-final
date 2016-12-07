var path = require('path'),
    _ = require('lodash'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app)
    io = require('socket.io')(http);

var options = {
  port: process.env.PORT || 8080
};


app.use('/', express.static(path.join(__dirname, 'public')));

var players = {};

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('join', function(data, fn) {
    var result = addPlayer(socket, data.username);
    fn(result);
  });
});

function addPlayer(socket, username) {
  if (username == null || _.find(players, {username : username})) {
    return {
      error : true,
      message : `The name "${username}" is already in use.`
    };
  } else {
    players[socket.id] = {
      username : username,
      socket : socket.id
    };
    socket.join('game');
    addListeners(socket);
    console.log('Added a new player');
    console.log(players);
    return {error : false};
  }
}

function addListeners(socket) {
  socket.on('new message', function(data) {
    console.log('message received: ' + data.message);
    var username = players[socket.id].username;
    io.emit('update message', {
      messages: [
        {
          user : username,
          message : data.message
        }
      ]
    });
  });
}

http.listen(options.port, function () {
  console.log('Game server listening on port ' + options.port);
});
