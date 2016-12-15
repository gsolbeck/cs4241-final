/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

var _ = require('lodash');

var Player = require('./player'),
    Rule = require('./rule');

var GAME_ID = 1;

class Game {
  constructor(io, config) {
    this.io = io;
    this.config = config;

    this.id = GAME_ID++;
    this.groupName = `game ${GAME_ID}`;
    this.updates = [];
    this.players = {};
    this.rules = [];//[new rule.LengthRule('short rule', 10)];

    this.io.open(
      function(socket) {
        console.log('a player connected')
      },
      {
        'join' : function(clientId, data, callback) {
          var result = this.addPlayer(data.username, clientId);
          callback(result);
          this.io.send(clientId, 'update', {
            updates : this.updates
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
      'message' : this.handleMessage.bind(this),
      'proposal' : this.handleProposal.bind(this),
      'disconnect' : function() {
        console.log(`a player disconnected: ${player.username}`)
        delete this.players[player.id];
      }.bind(this)
    });
  }

  handleMessage(clientId, data, callback) {
    var player = _.find(this.players, {clientId : clientId});
    console.log(`message received from ${player.username}: ${data.message}`);

    for (var r of this.rules) {
      if (!r.validate(data.message)) {
        callback({
          error : true,
          message : `"${data.message}" fails rule ${r.name} (${r.description})`
        });
        return;
      }
    }

    callback({ error : false });

    var update = {
      type : 'message',
      user : player.username,
      message : data.message
    }
    this.updates.push(update);
    while (this.updates.length > this.config.messageLimit) {
      this.updates.shift();
    }
    this.io.groupSend(this.groupName, 'update', {
      updates: [
        update
      ]
    });
  }

  handleProposal(clientId, data) {
    var player = _.find(this.players, {clientId : clientId});
    console.log(`rule proposed by ${player.username}: ${data.name}`);
    var rule;
    if (data.type == 'length') {
      rule = new Rule.LengthRule(data.name, data.length);
    } else {
      rule = new Rule.PhraseRule(data.name, data.phrase, data.type == 'include');
    }
    this.rules.push(rule);
    var update = {
      type : 'proposal',
      id : 0, //TODO
      name : rule.name,
      description : rule.description
    };
    this.updates.push(update);
    this.io.groupSend(this.groupName, 'update', {
      updates: [
        update
      ]
    });
  }
}

module.exports = Game;
