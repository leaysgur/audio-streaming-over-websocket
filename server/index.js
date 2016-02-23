'use strict';

const PORT = process.env.port || 9999;

const http = require('http').Server();
const io = require('socket.io')(http);

let sub = Object.create({});
let ch  = Object.create({});

io.on('connection', (socket) => {
  let socketId = socket.id;
  console.log(`user connected    -> id: ${socketId}`);

  update();

  socket.on('pub:ch', (chName) => {
    ch[chName] = socketId;

    update();
    socket.join(chName);
    console.log(`Pub: ${socketId} create #${chName}`);
  });

  socket.on('sub:connect', () => {
    sub[socketId] = 1;

    update();
  });

  socket.on('sub:join', (chName) => {
    socket.join(chName);
    console.log(`Sub: ${socketId} join to #${chName}`);
  });

  socket.on('sub:leave', (chName) => {
    socket.leave(chName);
    console.log(`Sub: ${socketId} leave #${chName}`);
  });

  socket.on('audio', (data) => {
    socket.to(data.ch).emit('audio', data.buf);
  });

  socket.on('disconnect', () => {
    console.log(`user disconnected -> id: ${socketId}`);
    if (socketId in sub) {
      delete sub[socketId];
    } else {
      Object.keys(ch).forEach((chName) => {
        if (ch[chName] === socketId) {
          socket.to(chName).emit('delCh');
          delete ch[chName];
        }
      });
    }

    update();
  });


  function update() {
    console.log(`Ch:`, ch);
    socket.emit('ch', ch);
    socket.broadcast.emit('ch', ch);
  }

});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
