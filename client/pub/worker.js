'use strict';
importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.4.5/socket.io.min.js');

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
