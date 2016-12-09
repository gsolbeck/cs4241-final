/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

var path = require('path'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app);

var Connection = require('./src/connection'),
    Game = require('./src/game'),
    options = require('./src/options');


app.use('/', express.static(path.join(__dirname, 'public')));

var io = new Connection(http);

var game = new Game(io);

http.listen(options.port, function () {
  console.log('Game server listening on port ' + options.port);
});
