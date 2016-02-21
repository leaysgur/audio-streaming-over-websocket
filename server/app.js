'use strict';

const PORT = 3000;

const http = require('http').Server();
const io = require('socket.io')(http);

let sub = Object.create({});
let getSubNum = () => {
  return Object.keys(sub).length;
};

io.on('connection', (socket) => {
  let socketId = socket.id;
  console.log(`user connected -> id: ${socketId}`);

  notifySubNum();

  socket.on('sub:connect', () => {
    sub[socketId] = 1;
    notifySubNum();
  });

  socket.on('audio', (buf) => {
    socket.broadcast.emit('audio', buf);
  });

  socket.on('disconnect', () => {
    console.log(`user disconnected -> id: ${socketId}`);
    if (socketId in sub) {
      delete sub[socketId];
    }
    notifySubNum();
  });


  function notifySubNum() {
    socket.emit('subNum', getSubNum());
    socket.broadcast.emit('subNum', getSubNum());
  }

});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
