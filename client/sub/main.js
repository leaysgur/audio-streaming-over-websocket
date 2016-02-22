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
    _socket: null,
    _ctx:    null,
    _startTime: 0,
    _audio: {
      gain: null
    },
    _watch: {
      volume: null
    },
    state: {
      isSub: false
    },
    volume: 0,
    subNum: 0
  },
  events: {
    'hook:created':  function() { this._hookCreated(); }
  },
  methods: {
    startSub: function() {
      if (this.state.isSub) { return; }

      this._readyAudio();
      this.$data._socket.on('audio', this._handleAudioBuffer);
      this.state.isSub = true;
    },

    stopSub: function() {
      if (!this.state.isSub) { return; }

      this._resetAudio();
      this.$data._socket.off('audio', this._handleAudioBuffer);
      this.state.isSub = false;
    },

    _handleAudioBuffer: function(buf) {
      var ctx = this.$data._ctx;
      var audio = this.$data._audio;
      var f32Audio = new Float32Array(buf);
      var audioBuffer = ctx.createBuffer(1, BUFFER_SIZE, ctx.sampleRate);
      audioBuffer.getChannelData(0).set(f32Audio);

      var source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audio.gain);

      var currentTime = ctx.currentTime;
      if (currentTime < this.$data._startTime) {
        source.start(this.$data._startTime);
        this.$data._startTime += audioBuffer.duration;
      } else {
        source.start(this.$data._startTime);
        this.$data._startTime = currentTime + audioBuffer.duration;
      }
    },

    _hookCreated: function() {
      var $data = this.$data;
      $data._ctx = new AudioContext();

      $data._socket = io(SOCKET_SERVER);
      $data._socket.emit('sub:connect');
      $data._socket.on('subNum', function(num) {
        $data.subNum = num;
      });
    },

    _readyAudio: function() {
      var ctx = this.$data._ctx;
      var audio = this.$data._audio;
      audio.gain = ctx.createGain();
      audio.gain.gain.value = this.volume;
      audio.gain.connect(ctx.destination);

      this.$data._watch.volume = this.$watch('volume', this._onChangeVolume);
    },

    _resetAudio: function() {
      var audio = this.$data._audio;
      var watch = this.$data._watch;
      Object.keys(audio).forEach(function(key) {
        audio[key] && audio[key].disconnect();
        audio[key] = null;
      }, this);

      Object.keys(watch).forEach(function(key) {
        watch[key]();
        watch[key] = null;
      }, this);
    },

    _onChangeVolume: function(val) {
      this.$data._audio.gain.gain.value = val;
    }
  }
};

new Vue(subApp);

}(this));
