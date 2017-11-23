'use strict';

var singleSpec = require('./single');
var multipleSpec = require('./multiple');

module.exports = function (boot, type) {
  var specObj = {
    single: singleSpec,
    multiple: multipleSpec
  };

  return specObj[type](boot);
};
