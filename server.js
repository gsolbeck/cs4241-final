var express = require('express'),
    app = express(),
    http = require('http').Server(app);

var options = {
  port: process.env.PORT || 8080
};


app.use('/', express.static(__dirname + '/public'));

http.listen(options.port, function () {
  console.log('Game server listening on port ' + options.port);
});
