'use strict';
var io = require('socket.io-client');

module.exports = function(self) {
  var socket = null;

  self.addEventListener('message', function(ev) {
    var payload = ev.data;
    switch (payload.type) {
    case 'init':
      _init(payload.data);
      break;
    case 'audio':
      socket.emit('audio', payload.data);
      break;
    }
  });

  function _init(data) {
    socket = io(data.SOCKET_SERVER);
    socket.on('subNum', function(num) {
      self.postMessage({
        type: 'subNum',
        data: num
      });
    });
  }

};
