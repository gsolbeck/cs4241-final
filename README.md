# The Worst Form of Communication #

*The Worst Form of Communication (WFC)* is a chat where all rules are
made by purely democratic vote. As a group, decide upon forbidden phrases,
message limits, or even required words!

This is the final project for CS4241 (Webware).

### The Team ###

This project was designed and implemented by Gareth Solbeck.


## Socket messages: ##

*WFC* uses websockets to create bidirectional persistent connections with all
clients. The data format specifications for all messages sent via these
connections can be found below.


### Client-to-server ###

**`join`** : add the current client to a given room

```javascript
{
  username : '<username to assign to the client>'
}

// callback function is given the following:
{
  error : true | false,
  message : '<error message if error == true>'
}
```


**`message`** : send a message to all users in the chat

```javascript
{
  message : '<message content>'
}

// callback function is given the following:
{
  error : true | false,
  message : '<error message if error == true>'
}
```


**`proposal`** : propose a rule

```javascript
{
  name : '<short name for rule>',
  type : 'include' | 'exclude' | 'length',
  phrase : '<phrase to be included/excluded> (for include/exclude rules only)',
  length : '<maximum length of message> (for length rules only)'
}
```


### Server-to-client ###

**`update`** : send new events to the client

```javascript
{
  updates : [
    // contains any of the following update types
    {
      type : 'message',
      user : '<username of sender>'
      message : '<message content>'
    },
    {
      type : 'proposal',
      id : '<id of rule>',
      name : '<short name of rule>',
      description : '<description of rule>'
    }
  ]
}
```
