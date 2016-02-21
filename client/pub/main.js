(function(global) {
'use strict';

var io  = global.io;
var Vue = global.Vue;
var gUM = navigator.getUserMedia.bind(navigator);
var AudioContext = global.AudioContext;

function _err(err) { console.error(err); }
function convertFloat32ToInt16(buffer) {
  var l = buffer.length;
  var buf = new Int16Array(l);
  while (l--) {
    buf[l] = Math.min(1, buffer[l])*0x7FFF;
  }
  return buf.buffer;
}


var pubApp = {
  el: '#jsPubApp',
  data: {
    socket: null,
    stream: null,
    ctx:    null,
    audio:  { source: null, processor: null }
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
      var socket = this.socket;
      this.audio.source    = this.ctx.createMediaStreamSource(this.stream);
      this.audio.processor = this.ctx.createScriptProcessor(1024);
      this.audio.processor.onaudioprocess = function(ev) {
        var buffers = [];
        for (var i = 0; i < ev.inputBuffer.numberOfChannels; i++) {
          buffers[i] = convertFloat32ToInt16(ev.inputBuffer.getChannelData(i));
        }
        socket.emit('audio', buffers);
      };
      this.audio.source.connect(this.audio.processor);
      this.audio.processor.connect(this.ctx.destination);
    },
    stopRec: function() {
      this.audio.processor && this.audio.processor.disconnect();
      this.audio.source    && this.audio.source.disconnect();
      this.audio.processor = null;
      this.audio.source    = null;
    },
    _hookCreated: function() {
      this.ctx = new AudioContext();
      this.socket = io('http://localhost:3000');
      this.socket.on('news', function(data) { console.log(data); });
    }
  },
  events: {
    'hook:created': function() { this._hookCreated(); }
  }
};

new Vue(pubApp);

}(this));
