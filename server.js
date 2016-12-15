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
    config = require('./src/config');


app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/readme.md', function(req, res) {
  res.sendFile(path.join(__dirname, 'README.md'));
});

var io = new Connection(http);

var game = new Game(io, config.gameConfig);

http.listen(config.port, function () {
  console.log('Game server listening on port ' + config.port);
});
