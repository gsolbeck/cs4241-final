/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

var path = require('path'),
    _ = require('lodash'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),

    Connection = require('./src/connection'),
    Player = require('./src/player'),
    options = require('./src/options');


app.use('/', express.static(path.join(__dirname, 'public')));

var io = new Connection(http);
var players = {};

io.open(
  function(socket) {
    console.log('a player connected')
  }, 
  {
    'join' : function(clientId, data, callback) {
      var result = addPlayer(data.username, clientId);
      callback(result);
    }
  }
);
io.addGroup('game');

function addPlayer(username, clientId) {
  if (username == null || _.find(players, {username : username})) {
    return {
      error : true,
      message : `The name "${username}" is already in use.`
    };
  } else {
    var addedPlayer = new Player(username, clientId);
    players[addedPlayer.id] = addedPlayer;
    io.addToGroup(addedPlayer.clientId, 'game');
    addListeners(addedPlayer);
    console.log(`a player joined: ${username}`);
    return { error : false };
  }
}

function addListeners(player) {
  io.addListeners(player.clientId, {
    'new message' : function(clientId, data) {
      console.log(`message received from ${player.username}: ${data.message}`);
      io.groupSend('game', 'update message', {
        messages: [
          {
            user : player.username,
            message : data.message
          }
        ]
      });
    },
    'disconnect' : function() {
      console.log(`a player disconnected: ${player.username}`)
      delete players[player.id];
    }
  });
}

http.listen(options.port, function () {
  console.log('Game server listening on port ' + options.port);
});
