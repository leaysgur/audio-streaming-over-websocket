'use strict';

const PORT = 3000;

const http = require('http').Server();
const io = require('socket.io')(http);

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('audio', (data) => {
    socket.emit('news', data);
    socket.broadcast.emit('news', data);
  });
});

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
