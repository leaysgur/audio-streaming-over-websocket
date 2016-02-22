'use strict';

var Vue = require('vue');
var pubApp = require('./app');

require('../cmn/polyfill').polyfill();

new Vue(pubApp);
