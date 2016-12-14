/*
 * Gareth Solbeck, 2015
 * (borrowed from past project)
 */

var _ = require('lodash');
var Server = require('socket.io');

// GLOBALS //
var CLIENT_ID = 1;
var clients = {};
var groups = {};

// FUNCTIONS //

/**
 * @classdesc
 * The Connection object provides a wrapper around whatever transport is
 *  actually being used. This means that if the underlying transport were to
 *  change, then the only modifications would be to this file.
 *
 * @constructor
 * @param srv - The server for the connection to use
 */
class Connection {
  constructor (srv) {
    if (!(this instanceof Connection)) {
      return new Connection(srv);
    }
    // io is implementation-specific and should not be used externally
    this.io = new Server(srv);
  }

  // LISTENER FUNCTIONS

  /**
   * Open the connection and attach listeners. All listeners are called with the
   *  arguments (clientId, data).
   *
   * @param {function} connectFn - The function to run when a socket connects to
   *  the server
   * @param {Object} listeners - An associative array of event-function pairs,
   *  where each denotes a function to be run when the given event is received.
   */

  open(connectFn, listeners) {
    this.io.on('connection', function(socket) {
      var id = CLIENT_ID++;
      clients[id] = socket;
      this.addListeners(id, listeners);
      connectFn(id);
    }.bind(this));
  }

  /**
   * Attach a listener to the given client.
   *
   * @param {Number} clientId - ID of the client to attach a listener to
   * @param {String} message - The message to listen for
   * @param {Function} listener - The listener, called with the arguments
   *  (clientId, data)
   */
  addListener(clientId, message, listener) {
    clients[clientId].on(message, _.partial(listener, clientId));
  }

  /**
   * Attach listeners to the given client.
   *
   * @param {Number} clientId - ID of the client to attach listeners to
   * listeners - An associative array of event-function pairs,
   *  where each denotes a function to be run when the given event is received.
   *  Functions are called with the arguments (clientId, data).
   */
  addListeners(clientId, listeners) {
    _.forEach(listeners, function(fn, msg) {
      this.addListener(clientId, msg, fn);
    }.bind(this));
  }

  // GROUP FUNCTIONS

  /**
   * Create a new group, and optionally add clients to the group. Groups are used
   *  to send messages to a subset of the connected users. Returns an error if the
   *  group identifier already exists.
   *
   * @param {String} group - The identifier of the group to create
   * @param {Number[]} [clients] - An array of client IDs to add to the group
   */
  addGroup(group, clients) {
    if (typeof(groups[group]) != 'undefined') {
      return new Error('Group <' + group + '> already exists')
    }
    if (typeof(clients) == 'undefined') {
      clients = [];
    }
    groups[group] = clients;
  }

  /**
   * Add a client to a group. If the group does not exist, returns an error.
   *
   * @param {Number} client - ID of the client to be added
   * @param {String} group - The group identifier
   */
  addToGroup(client, group) {
    if (typeof(groups[group]) == 'undefined') {
      return new Error('Group <' + group + '> does not exist');
    } else {
      groups[group].push(client);
      clients[client].join(group);
    }
  }

  /**
   * Remove a client from a group. If the group does not exist, or if the client
   *  is not in the group, return an error.
   *
   * @param {Number} client - ID of the client to be removed
   * @param {String} group - The group identifier
   */
  removeFromGroup(client, group) {
    if (typeof(groups[group]) == 'undefined') {
      return new Error('Group <' + group + '> does not exist');
    } else if (!_.includes(groups[group], client)) {
      return new Error('Client <' + group + '> is not in group <' + group + '>');
    } else {
      _.remove(groups[group], client);
      clients[client].leave(group);
    }
  }

  /**
   * Remove a group from the connection. If the group does not exist, returns an
   *  error.
   *
   * @param {String} group - Identifier of the group to be removed
   */
  removeGroup(group) {
    if (typeof(groups[group]) == 'undefined') {
      return new Error('Group does not exist: ' + group);
    } else {
      _.forEach(groups[group], function(c) {
        c.leave(group);
      });
      delete groups[group];
    }
  }

  // MESSAGE FUNCTIONS

  /**
   * Send a message with optional content to the given client.
   *
   * @param {Number} client - The client to send the message to
   * @param {String} message - The message to be sent
   * @param {Object} [content] - The content object to send with the message
   */
  send(client, message, content) {
    if (typeof(content) == 'undefined') {
      clients[client].emit(message);
    } else {
      clients[client].emit(message, content);
    }
  }

  /**
   * Send a message to all clients in a group except the source client.
   *
   * @param {Number} sourceClient - The source client, which should not receive
   *  the message
   * @param {String} group - The identifier for the group to receive the message
   * @param {String} message - The message to be sent
   * @param {Object} [content] - The content object to send with the message
   */
  broadcast(sourceClient, group, message, content) {
    if (typeof(content) == 'undefined') {
      clients[sourceClient].broadcast.to(group).emit(message);
    } else {
      clients[sourceClient].broadcast.to(group).emit(message, content);
    }
  }

  /**
   * Send a message to all clients in a group.
   *
   * @param {String} group - The identifier for the group to receive the message
   * @param {String} message - The message to be sent
   * @param {Object} [content] - The content object to send with the message
   */
  groupSend(group, message, content) {
    if (typeof(content) == 'undefined') {
      this.io.to(group).emit(message);
    } else {
      this.io.to(group).emit(message, content);
    }
  }
}

module.exports = Connection;
