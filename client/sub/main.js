(function(global) {
'use strict';

var io  = global.io;
var Vue = global.Vue;
var AudioContext = global.AudioContext;

var subApp = {
  el: '#jsSubApp',
  data: {
    socket: null,
    ctx:    null
  },
  methods: {
    _hookCreated: function() {
      this.ctx = new AudioContext();
      this.socket = io('http://localhost:3000');
      this.socket.emit('sub:connect');
    }
  },
  events: {
    'hook:created': function() { this._hookCreated(); }
  }
};

new Vue(subApp);

}(this));
