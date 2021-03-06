"use strict";
var path = require('path');
var Promise = require("bluebird");

module.exports = [];

require("fs").readdirSync(path.join(__dirname, "services")).forEach(function(file) {
  var service = require(path.join(__dirname, "services", file));
  if (service.search) {
    module.exports.push(service);
  }
});

