(function(global) {
'use strict';

var SOCKET_SERVER = global.SOCKET_SERVER;
var BUFFER_SIZE   = global.BUFFER_SIZE;

var io  = global.io;
var Vue = global.Vue;
var AudioContext = global.AudioContext;

var subApp = {
  el: '#jsSubApp',
  data: {
    socket: null,
    ctx:    null,
    volume: 0,
    subNum: 0,
    startTime: 0,
    audio: {
      gain: null
    },
    watch: {
      volume: null
    }
  },
  methods: {
    startSub: function() {
      if (this.audio.gain) { return; }
      this._readyAudio();
      this.socket.on('audio', this._handleAudioBuffer);
    },
    stopSub: function() {
      this._resetAudio();
      this.socket.off('audio', this._handleAudioBuffer);
    },
    _handleAudioBuffer: function(buf) {
      var f32Audio = new Float32Array(buf);
      var audioBuffer = this.ctx.createBuffer(1, BUFFER_SIZE, 44100);
      audioBuffer.getChannelData(0).set(f32Audio);

      var source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audio.gain);

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

      this.socket = io(SOCKET_SERVER);
      this.socket.emit('sub:connect');
      this.socket.on('subNum', function(num) {
        $data.subNum = num;
      });
    },
    _readyAudio: function() {
      this.audio.gain = this.ctx.createGain();
      this.audio.gain.gain.value = this.volume;
      this.audio.gain.connect(this.ctx.destination);

      this.watch.volume = this.$watch('volume', this._onChangeVolume);
    },
    _resetAudio: function() {
      Object.keys(this.audio).forEach(function(key) {
        this.audio[key] && this.audio[key].disconnect();
        this.audio[key] = null;
      }, this);

      Object.keys(this.watch).forEach(function(key) {
        this.watch[key]();
        this.watch[key] = null;
      }, this);
    },
    _onChangeVolume: function(val) {
      this.audio.gain.gain.value = val;
    }
  },
  events: {
    'hook:created':  function() { this._hookCreated(); }
  }
};

new Vue(subApp);

}(this));
