var path = require('path'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app)
    io = require('socket.io')(http);

var options = {
  port: process.env.PORT || 8080
};


app.use('/', express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.on('new message', function(data) {
    console.log('message received: ' + data.message);
    io.emit('update message', {
      messages: [
        {
          user : data.user,
          message : data.message
        }
      ]
    });
  });
});

http.listen(options.port, function () {
  console.log('Game server listening on port ' + options.port);
});
