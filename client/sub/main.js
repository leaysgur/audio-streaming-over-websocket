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
    startTime: 0,
    state: {
      audioReady: false
    }
  },
  methods: {
    startSub: function() {
      this.socket.on('audio', this._handleAudioBuffer);
    },
    stopSub: function() {
      this.socket.off('audio', this._handleAudioBuffer);
    },
    _handleAudioBuffer: function(buf) {
      var f32Audio = new Float32Array(buf);
      var audioBuffer = this.ctx.createBuffer(1, f32Audio.length, 44100);
      audioBuffer.getChannelData(0).set(f32Audio);

      var source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);

      var currentTime = this.ctx.currentTime;
      if (currentTime < this.startTime) {
        source.start(this.startTime);
        this.startTime += audioBuffer.duration;
      } else {
        source.start(this.startTime);
        this.startTime = currentTime + audioBuffer.duration;
      }
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
      document.body.addEventListener('touchstart', this._readyAudio, false);
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
        document.body.removeEventListener('touchstart', that._readyAudio, false);
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
