/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

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

  var proposalButton = $('#proposal-button');

  var ruleOverlay = $('#rule-overlay');
  var ruleForm = $('#rule-form');
  var ruleCancel = $('#rule-cancel');
  var ruleSubmit = $('#rule-submit');

  joinForm.submit(function(event) {
    event.preventDefault();
    sendJoinRequest();
  });

  messageForm.submit(function(event) {
    event.preventDefault();
    sendMessage();
  });

  ruleForm.submit(function(event) {
    event.preventDefault();
    sendRuleProposal();
  });

  proposalButton.click(function(event) {
    ruleOverlay.show();
  })

  ruleCancel.click(function(event) {
    ruleOverlay.hide();
    ruleForm.reset();
  });

  ruleOverlay.click(function(event) {
    ruleOverlay.hide();
    ruleForm.reset();
  });
  ruleOverlay.children().click(function(event) {
    event.stopPropagation();
  });

  function sendJoinRequest() {
    var data = {
      username : usernameInput.val()
    };
    socket.emit('join', data, handleJoinResponse);
  }

  function handleJoinResponse(data) {
    if (data.error) {
      joinError.text(data.message);
    } else {
      joined = true;
      $('#join-panel').hide();
      $('#message-panel').show();
      //messageInput.focus();
      messageInput.val('');
      socket.on('update message', handleUpdates);
    }
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

  function sendRuleProposal() {

  }

  var msgTemplate = _.template('<div><b><%- user %>:</b> <%- message %></div>');
  function handleUpdates(data) {
    data.messages.forEach(function(msg) {
      console.log('message received: ' + msg.message);
      var messageDiv = msgTemplate(msg);
      messageBox.append(messageDiv);
    });
  }

});
