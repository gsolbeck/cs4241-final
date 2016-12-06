$(document).ready(function() {
  console.log('Document loaded');
  var socket = io();

  var messageBox = $('#message-box');
  var submitButton = $('#submit-button');
  var messageForm = $('#message-form');
  var messageInput = $('#message-input');

  messageForm.submit(function(event) {
    event.preventDefault();
    socket.emit('new message', {
      user : 'anonymous',
      message : messageInput.val()
    });
    messageInput.val('');
  });

  socket.on('update message', function(data) {
    data.messages.forEach(function(msg) {
      console.log('message received: ' + msg.message);
      messageBox.append($('<div/>', {
        text : msg.user + ': ' + msg.message
      }));
    });
  });

});
