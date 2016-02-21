(function(global) {
'use strict';

var io  = global.io;
var Vue = global.Vue;
var AudioContext = global.AudioContext;


var initial_delay_sec = 0,
    scheduled_time = 0;

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
      this.socket.on('audio', this._handleAudioBuffer);
    },
    stopSub: function() {
      this.socket.off('audio');
    },
    _handleAudioBuffer: function(buf) {
      var audio_f32 = new Float32Array(buf);
      var audio_buf = this.ctx.createBuffer(1, audio_f32.length, 44100);
      audio_buf.getChannelData(0).set(audio_f32);

      var audio_src = this.ctx.createBufferSource();
      audio_src.buffer = audio_buf;
      audio_src.connect(this.ctx.destination);

      var current_time = this.ctx.currentTime;

      if (current_time < scheduled_time) {
        audio_src.start(scheduled_time);
        scheduled_time += audio_buf.duration;
      } else {
        audio_src.start(scheduled_time);
        scheduled_time = current_time + audio_buf.duration + initial_delay_sec;
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
