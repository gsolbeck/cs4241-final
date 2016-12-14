/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

var _ = require('lodash');

var Player = require('./player');

var GAME_ID = 1;

class Game {
  constructor(io, config) {
    this.io = io;
    this.config = config;

    this.id = GAME_ID++;
    this.groupName = `game ${GAME_ID}`;
    this.messages = [];
    this.players = {};

    this.io.open(
      function(socket) {
        console.log('a player connected')
      },
      {
        'join' : function(clientId, data, callback) {
          var result = this.addPlayer(data.username, clientId);
          callback(result);
          this.io.send(clientId, 'update message', {
            messages : this.messages
          });
        }.bind(this)
      }
    );
    this.io.addGroup(this.groupName);
  }

  addPlayer(username, clientId) {
    if (username == null || _.find(this.players, {username : username})) {
      return {
        error : true,
        message : `The name "${username}" is already in use.`
      };
    } else {
      var addedPlayer = new Player(username, clientId);
      this.players[addedPlayer.id] = addedPlayer;
      this.io.addToGroup(addedPlayer.clientId, this.groupName);
      this.addListeners(addedPlayer);
      console.log(`a player joined: ${username}`);
      return { error : false };
    }
  }

  addListeners(player) {
    this.io.addListeners(player.clientId, {
      'new message' : this.handleMessage.bind(this),
      'disconnect' : function() {
        console.log(`a player disconnected: ${player.username}`)
        delete this.players[player.id];
      }.bind(this)
    });
  }

  handleMessage(clientId, data) {
    var player = _.find(this.players, {clientId : clientId});
    console.log(`message received from ${player.username}: ${data.message}`);


    this.messages.push({
        user : player.username,
        message : data.message
    });
    while (this.messages.length > this.config.messageLimit) {
      this.messages.shift();
    }
    this.io.groupSend(this.groupName, 'update message', {
      messages: [
        {
          user : player.username,
          message : data.message
        }
      ]
    });
  }
}

module.exports = Game;
