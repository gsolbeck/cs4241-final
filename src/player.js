/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

var PLAYER_ID = 1;

function Player(username, clientId) {
  this.id = PLAYER_ID++;
  this.username = username;
  this.clientId = clientId;
  this.gameId = 0;
}

module.exports = Player;
