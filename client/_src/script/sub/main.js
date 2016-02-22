'use strict';

var Vue = require('vue');
var subApp = require('./app');

require('../cmn/polyfill').polyfill();

new Vue(subApp);
