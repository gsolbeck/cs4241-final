/*
 * Gareth Solbeck, 2016
 * CS 4241
 */

var RULE_ID = 1;

class LengthRule {
  constructor(name, length) {
    this.name = name;
    this.length = length;

    this.id = RULE_ID++;

    this.description = `must be no more than ${length} characters long`;
  }

  validate(message) {
    return message.length <= this.length;
  }
}

class PhraseRule {
  constructor(name, phrase, contains) {
    this.name = name;
    this.phrase = phrase;
    this.contains = contains;

    this.id = RULE_ID++;

    var notString = contains ? '' : 'not ';
    this.description = `must ${notString}contain the phrase "${phrase}"`;
  }

  validate(message) {
    return this.contains == message.includes(this.phrase);
  }
}

module.exports = {
  LengthRule : LengthRule,
  PhraseRule : PhraseRule
};
