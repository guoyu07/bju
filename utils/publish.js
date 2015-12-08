var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Messager() {
  EventEmitter.call(this);
}

util.inherits(Messager, EventEmitter);

var messager = new Messager();

module.exports = messager;
