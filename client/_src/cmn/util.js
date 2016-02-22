'use strict';
module.exports = {
  disconnectAll: function(audioNodes) {
    Object.keys(audioNodes).forEach(function(key) {
      audioNodes[key] && audioNodes[key].disconnect();
      audioNodes[key] = null;
    });
  },

  unwatchAll: function(watch) {
    Object.keys(watch).forEach(function(key) {
      watch[key]();
      watch[key] = null;
    });
  }
};
