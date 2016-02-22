(function(global) {
'use strict';

var io  = global.io;
var Vue = global.Vue;
var gUM = navigator.getUserMedia.bind(navigator);
var AudioContext = global.AudioContext;

function _err(err) { console.error(err); }


var pubApp = {
  el: '#jsPubApp',
  data: {
    socket: null,
    stream: null,
    ctx:    null,
    audio:  {
      source:    null,
      processor: null,
      analyser:  null,
      gain:      null
    },
    subNum: 0
  },
  methods: {
    onMic: function() {
      if (this.stream) { return; }
      var that = this;
      gUM({ audio: true }, function(stream) { that.stream = stream; }, _err);
    },
    offMic:  function() {
      if (!this.stream) { return; }
      this.stream.getTracks().forEach(function(t) { t.stop(); });
      this.stream = null;
      this.stopRec();
    },
    startRec: function() {
      if (!this.stream) { return; }
      if (this.audio.source && this.audio.processor) { return; }
      this.audio.source    = this.ctx.createMediaStreamSource(this.stream);
      this.audio.analyser  = this.ctx.createAnalyser();
      this.audio.processor = this.ctx.createScriptProcessor(1024);
      this.audio.gain      = this.ctx.createGain();

      this.audio.analyser.smoothingTimeConstant = 0.4;
      this.audio.analyser.fftSize = 1024;
      this.audio.processor.onaudioprocess = this._onAudioProcess;
      this.audio.gain.gain.value = 0;

      this.audio.source.connect(this.audio.processor);
      this.audio.source.connect(this.audio.analyser);
      this.audio.processor.connect(this.audio.gain);
      this.audio.gain.connect(this.ctx.destination);

      this._drawInputSpectrum();
    },
    stopRec: function() {
      cancelAnimationFrame(this._drawInputSpectrum);
      this.audio.processor && this.audio.processor.disconnect();
      this.audio.source    && this.audio.source.disconnect();
      this.audio.analyser  && this.audio.analyser.disconnect();
      this.audio.gain      && this.audio.gain.disconnect();
      this.audio.processor = null;
      this.audio.source    = null;
      this.audio.analyser  = null;
      this.audio.gain      = null;
    },
    _onAudioProcess: function(ev) {
      var socket = this.socket;
      var inputBuffer  = ev.inputBuffer;
      var outputBuffer = ev.outputBuffer;
      var buffers = [];
      for (var ch = 0; ch < outputBuffer.numberOfChannels; ch++) {
        var inputData  = inputBuffer.getChannelData(ch);
        var outputData = outputBuffer.getChannelData(ch);
        buffers[ch] = new Float32Array(1024);

        for (var sample = 0; sample < inputBuffer.length; sample++) {
          outputData[sample] = buffers[ch][sample] = inputData[sample];
        }
      }
      socket.emit('audio', buffers[0].buffer);
    },
    _drawInputSpectrum: function() {
      if (!this.audio.analyser) { return; }
      var $canvas = this.$els.canvas;
      var drawContext = $canvas.getContext('2d');
      var fbc = this.audio.analyser.frequencyBinCount;
      var freqs = new Uint8Array(this.audio.analyser.frequencyBinCount);
      this.audio.analyser.getByteFrequencyData(freqs);

      drawContext.clearRect(0, 0, $canvas.width, $canvas.height);
      for (var i = 0; i < freqs.length; i++) {
        var barWidth = $canvas.width / fbc;
        // 0 - 255の値が返るのでそれを使って描画するバーの高さを得る
        var height = $canvas.height * (freqs[i] / 255);
        var offset = $canvas.height - height;
        drawContext.fillStyle = 'hsl(' + (i / fbc * 360) + ', 100%, 50%)';
        drawContext.fillRect(i * barWidth, offset, barWidth + 1, height);
      }
      requestAnimationFrame(this._drawInputSpectrum);
    },
    _hookCreated: function() {
      var $data = this.$data;
      this.ctx = new AudioContext();
      this.socket = io(global.SOCKET_SERVER);
      this.socket.on('subNum', function(num) {
        $data.subNum = num;
      });
    },
    _hookAttached: function() {
      this.$els.canvas.width  = window.innerWidth;
      this.$els.canvas.height = window.innerWidth / 10;
      this.$els.canvas.style.width  = '100%';
      this.$els.canvas.style.height = '10%';
    }
  },
  events: {
    'hook:created':  function() { this._hookCreated(); },
    'hook:attached': function() { this._hookAttached(); }
  }
};

new Vue(pubApp);

}(this));
