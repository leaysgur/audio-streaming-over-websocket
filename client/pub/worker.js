'use strict';
importScripts('../../node_modules/socket.io-client/socket.io.js');

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
  socket = self.io(data.SOCKET_SERVER);
  socket.on('subNum', function(num) {
    self.postMessage({
      type: 'subNum',
      data: num
    });
  });
}
