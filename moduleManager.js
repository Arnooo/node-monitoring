/*!
 * Module manager
 * Copyright(c) 2014 Arnaud Jouobel <arnaud.joubel@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var npm = require('npm'),
        Q = require('q');

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
  self.moduleCompatible_={
      'node-w1bus':'0.1.2'
  };
  npm.load(function (err) {
      if(err){
        throw err;
      }
      self.moduleCompatibleInstalled_={};
      self.ls_()
      .then(function(){
        npm.config.set('global', true);
        return self.ls_();
      })
      .catch(function(err){
          console.error(err);
      })
      .done(function(){
          console.log(self.moduleCompatibleInstalled_);
      });
  });
}

ModuleManager.prototype.ls_ = function (args){
    var self = this;
    var deferred = Q.defer(); 
    npm.commands.ls(args, true, function (er, data) {
      // log the error or data
      for(var dep in data.dependencies){
          self.moduleCompatibleInstalled_[dep]=data.dependencies[dep].version;
      }
      deferred.resolve();
    });
    npm.on("log", function (message) {
      // log the progress of the installation
      //console.log(message);
    });
    return deferred.promise;
};

ModuleManager.prototype.install_ = function (moduleArray){
    npm.commands.install(moduleArray, function (er, data) {
      // log the error or data
    });
    npm.on("log", function (message) {
      // log the progress of the installation
      //console.log(message);
    });
};


var test = new ModuleManager();
