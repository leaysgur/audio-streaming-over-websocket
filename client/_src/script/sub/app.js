'use strict';
var util  = require('../cmn/util');
var Const = require('../cmn/const');
var work = require('webworkify');

var SOCKET_SERVER = Const.SOCKET_SERVER;
var BUFFER_SIZE   = Const.BUFFER_SIZE;

module.exports = {
  el: '#jsSubApp',
  data: {
    _ctx:    null,
    _worker: null,
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
    ch:     {},
    chName: '',
    volume: 0
  },
  computed: {
    hasCh: function() { return Object.keys(this.ch).length !== 0; }
  },
  events: {
    'hook:created':  function() { this._hookCreated(); }
  },
  methods: {
    startSub: function() {
      if (this.state.isSub) { return; }

      this.$data._worker.postMessage({
        type: 'SUB_JOIN',
        data: this.chName
      });
      this._readyAudio();
      this.state.isSub = true;
    },

    stopSub: function() {
      if (!this.state.isSub) { return; }

      this.$data._worker.postMessage({
        type: 'SUB_LEAVE',
        data: this.chName
      });
      this._resetAudio();
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
      $data._ctx = new window.AudioContext();

      $data._worker = work(require('./worker.js'));
      $data._worker.addEventListener('message', this._handleWorkerMsg);
      $data._worker.postMessage({
        type: 'INIT',
        data: {
          SOCKET_SERVER: SOCKET_SERVER
        }
      });
    },

    _handleWorkerMsg: function(ev) {
      var $data = this.$data;
      var payload = ev.data;
      switch (payload.type) {
      case 'ch':
        $data.ch = payload.data;
        break;
      case 'audio':
        this._handleAudioBuffer(payload.data);
        break;
      case 'delCh':
        location.reload();
        break;
      }
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
      util.disconnectAll(this.$data._audio);
      util.unwatchAll(this.$data._watch);
    },

    _onChangeVolume: function(val) {
      this.$data._audio.gain.gain.value = val;
    }
  }
};

