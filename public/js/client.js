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
    ruleForm[0].reset();
  });

  ruleOverlay.click(function(event) {
    ruleOverlay.hide();
    ruleForm[0].reset();
  });
  ruleOverlay.children().click(function(event) {
    event.stopPropagation();
  });

  ruleOverlay.find('input[type=radio]').change(function(event) {
    if (this.value == 'length') {
      $('#length-input').attr('disabled', false);
      $('#phrase-input').attr('disabled', true);
    } else if (this.value == 'include' || this.value == 'exclude') {
      $('#length-input').attr('disabled', true);
      $('#phrase-input').attr('disabled', false);
    }
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
      socket.on('update', handleUpdates);
    }
  }

  var errorTemplate =_.template('<div><i><%- message %></i></div>');
  function sendMessage() {
    if (joined) {
      socket.emit('message', {
        message : messageInput.val()
      }, function(data) {
        if (data.error) {
          messageBox.append(errorTemplate(data));
        }
      });
    } else {
      console.log('Player has not joined');
    }
    messageInput.val('');
  }

  function sendRuleProposal() {
    var data = {};
    $.each(ruleForm.serializeArray(), function(i, field) {
      data[field.name] = field.value;
    });
    if (data.type == 'length') {
      data = _.omit(data, 'phrase');
    } else {
      data = _.omit(data, 'length');
    }
    console.log(data);
    socket.emit('proposal', data);

    ruleOverlay.click();
  }

  var msgTemplate = _.template('<div><b><%- user %>:</b> <%- message %></div>');
  var ruleTemplate =_.template('<div><i>New rule: <%- name %> (<%- description %>)</i></div>');
  function handleUpdates(data) {
    data.updates.forEach(function(u) {
      if (u.type == 'message') {
        console.log('message received: ' + u.message);
        var messageDiv = msgTemplate(u);
      } else if (u.type == 'proposal') {
        var messageDiv = ruleTemplate(u);
      }
      messageBox.append(messageDiv);
    });
  }

});
