'use strict';
var io = require('socket.io-client');

module.exports = function(self) {
  var socket = null;

  self.addEventListener('message', function(ev) {
    var payload = ev.data;
    switch (payload.type) {
    case 'INIT':
      socket = io(payload.data.SOCKET_SERVER);
      break;
    case 'CH':
      socket.emit('pub:ch', payload.data);
      break;
    case 'AUDIO':
      socket.emit('audio', payload.data);
      break;
    }
  });
};
