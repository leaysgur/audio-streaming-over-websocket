(function(global) {
'use strict';

var io  = global.io;
var Vue = global.Vue;
var AudioContext = global.AudioContext;

var subApp = {
  el: '#jsSubApp',
  data: {
    socket: null,
    ctx:    null,
    subNum: 0,
    state: {
      audioReady: false
    }
  },
  methods: {
    startSub: function() {
      this.socket.on('audio', function(buf) {
        console.log(buf);
      });
    },
    stopSub: function() {
      this.socket.off('audio');
    },
    _hookCreated: function() {
      var $data = this.$data;
      this.ctx = new AudioContext();
      this.socket = io(global.SOCKET_SERVER);
      this.socket.emit('sub:connect');
      this.socket.on('subNum', function(num) {
        $data.subNum = num;
      });
    },
    _hookAttached: function() {
      this.$el.addEventListener('click', this._readyAudio, false);
    },
    _readyAudio: function() {
      var that = this;
      var osc = this.ctx.createOscillator();
      osc.connect(this.ctx.destination);
      osc.start(0);
      setTimeout(function() {
        osc.stop(0);
        osc.disconnect();
        osc = null;
        that.state.audioReady = true;
        that.$el.removeEventListener('click', that._readyAudio, false);
      }, 400);
    }
  },
  events: {
    'hook:created':  function() { this._hookCreated(); },
    'hook:attached': function() { this._hookAttached(); }
  }
};

new Vue(subApp);

}(this));
