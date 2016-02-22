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
    audio:  { source: null, processor: null },
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
      this.audio.processor = this.ctx.createScriptProcessor(1024);
      this.audio.processor.onaudioprocess = this._onAudioProcess;
      this.audio.source.connect(this.audio.processor);
      this.audio.processor.connect(this.ctx.destination);
    },
    stopRec: function() {
      this.audio.processor && this.audio.processor.disconnect();
      this.audio.source    && this.audio.source.disconnect();
      this.audio.processor = null;
      this.audio.source    = null;
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
    _hookCreated: function() {
      var $data = this.$data;
      this.ctx = new AudioContext();
      this.socket = io(global.SOCKET_SERVER);
      this.socket.on('subNum', function(num) {
        $data.subNum = num;
      });
    }
  },
  events: {
    'hook:created': function() { this._hookCreated(); }
  }
};

new Vue(pubApp);

}(this));
