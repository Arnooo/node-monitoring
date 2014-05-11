/*!
 * Module manager
 * Copyright(c) 2014 Arnaud Jouobel <arnaud.joubel@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var npm = require('npm');

/**
 * Version.
 */
exports.version = '0.1.0';

/**
 * Create ModuleManager object and return it
 *
 * @api public
 */
exports.create = function() {
    return new ModuleManager();
};

function ModuleManager (){
  var self = this;
  self.ls_();
}

ModuleManager.prototype.ls_ = function (){
    npm.load(function (err) {
      // catch errors
      npm.commands.ls(function (er, data) {
        // log the error or data
      });
      npm.on("log", function (message) {
        // log the progress of the installation
        console.log(message);
      });
    });
};

ModuleManager.prototype.install_ = function (moduleArray){
    npm.load(function (err) {
      // catch errors
      npm.commands.install(moduleArray, function (er, data) {
        // log the error or data
      });
      npm.on("log", function (message) {
        // log the progress of the installation
        console.log(message);
      });
    });
};


var test = new ModuleManager();
