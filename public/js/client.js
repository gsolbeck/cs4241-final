$(document).ready(function() {
  console.log('Document loaded');
  var socket = io();
  var joined = false;

  var joinForm = $('#join-form');
  var joinError = $('#join-error');
  var usernameInput = $('#username-input');

  var messageBox = $('#message-box');
  var messageButton = $('#message-button');
  var messageForm = $('#message-form');
  var messageInput = $('#message-input');

  joinForm.submit(function(event) {
    event.preventDefault();
    sendJoinRequest();
  });

  messageForm.submit(function(event) {
    event.preventDefault();
    sendMessage();
  });

  socket.on('update message', function(data) {
    data.messages.forEach(function(msg) {
      console.log('message received: ' + msg.message);
      messageBox.append($('<div/>', {
        text : msg.user + ': ' + msg.message
      }));
    });
  });

  function sendJoinRequest() {
    var data = {
      username : usernameInput.val()
    };
    socket.emit('join', data, function(data) {
      if (data.error) {
        joinError.text(data.message);
      } else {
        joined = true;
        $('#join-panel').hide();
        $('#message-panel').show();
        messageInput.focus();
        messageInput.val('');
      }
    });
  }

  function sendMessage() {
    if (joined) {
      socket.emit('new message', {
        message : messageInput.val()
      });
    } else {
      console.log('Player has not joined');
    }
    messageInput.val('');
  }

});
