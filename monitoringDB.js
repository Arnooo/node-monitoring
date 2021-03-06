/*!
 * MonitoringDB
 * Copyright(c) 2014 Arnaud Jouobel <arnaud.joubel@gmail.com>
 * MIT Licensed
 */

var mysql =  require('mysql'),
       fs = require('fs'),
        Q = require('q');

var MONITORING_DB="MonitoringDB";
var USE_MOCK = false;

var createError = function (errorMsg){
  return new Error(errorMsg);
};

/**
 * Create MonitoringDB object and return it
 *
 * @api public
 */
exports.create = function(config) {
  return new MonitoringDB(config);
};

exports.useMock = function() {
    USE_MOCK = true;
};

/**
 * MonitoringDB constructor.
 *
 * @api public
 */
function MonitoringDB(config){
    var self = this;
    self.isConnectedToDB_=false;

    //read config
    self.config_= {
      host: config.db_host,
      user: config.db_user,
      password: config.db_password,
      connectTimeout: 1000 //1 second
    };
};

MonitoringDB.prototype.init = function(){
    var self=this;
    var deferred = Q.defer(); 

    self.isConnected_()
    .then(function() {
        return self.isDatabaseExist_();
    })
    .then(function() {
        self.isConnectedToDB_=true;
        self.pool_ = mysql.createPool(self.config_);
        deferred.resolve();
    })
    .catch(function(err){
        deferred.reject(err);
    });
    return deferred.promise;
};

MonitoringDB.prototype.isConnectedToDB = function(){
  return self.isConnectedToDB_;
};

MonitoringDB.prototype.isConnected_ = function(){
    var self = this;
    var deferred = Q.defer(); 
    var connection = mysql.createConnection({
        host : self.config_.host,
        user : self.config_.user,
        password: self.config_.password,
        connectTimeout: self.config_.connectTimeout
    });
    console.log("Trying to connect to DB!");
    if(USE_MOCK){
        if(self.config_.host === "127.0.0.1"){
            var msg = "Success Mock: Connected to database server: "+self.config_.host;
            deferred.resolve({msg:msg});
            console.log(msg);
        }
        else{
            var msg = "Error Mock: Cannot connect to the database!";
            console.error(msg);
            deferred.reject(createError(msg));
        }
    }
    else{
        connection.connect(function(err) {
            if(err){
                var msg = "Error: Cannot connect to the database!";
                console.error(msg);
                deferred.reject(createError(msg));
            }
            else{
                var msg = "Success: Connected to database server: "+self.config_.host;
                deferred.resolve({msg:msg});
                console.log(msg);
            }
        });
        connection.end();
    }
    return deferred.promise;
};

MonitoringDB.prototype.isDatabaseExist_ = function(){
    var self = this;
    var deferred = Q.defer(); 
    var connection = mysql.createConnection({
        host : self.config_.host,
        user : self.config_.user,
        password: self.config_.password,
        connectTimeout: self.config_.connectTimeout
    });
    var queryStr="SHOW DATABASES LIKE '"+MONITORING_DB+"'";
    console.log(queryStr);
    if(USE_MOCK){
        var msg = "Success Mock: Database "+MONITORING_DB+" exist.";
        deferred.resolve({msg:msg});
        console.log(msg);
    }
    else{
        connection.query(queryStr, function(err, results) {
            if(!results[0]){
                console.error("Error: "+MONITORING_DB+" database does not exist!");
                deferred.reject(createError("Error: "+MONITORING_DB+" database does not exist!"));
            }
            else{
                var msg = "Success: Database "+MONITORING_DB+" exist.";
                deferred.resolve({msg:msg});
                console.log(msg);
            }
        });
        connection.end();
    }
    return deferred.promise;
};

MonitoringDB.prototype.createDB = function(){
  var self = this;
  var deferred = Q.defer(); 
  fs.readFile(__dirname+'/createMonitoringDB.sql', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var queryStr=data.replace(/\n/g,'');
    console.log(queryStr);

    var connection = mysql.createConnection({
      host : self.config_.host,
      user : self.config_.user,
      password: self.config_.password,
      connectTimeout: self.config_.connectTimeout,
      multipleStatements: true
    });
    connection.query(queryStr, function(err, results) {
        if(err){
            deferred.reject(createError("Error: Cannot create the database: "+MONITORING_DB));
        }
        else{
            var msg = "Success: Database "+MONITORING_DB+" created!";
            deferred.resolve({msg:msg});
            console.log(msg);
        }
    });
    connection.end();
  });
  return deferred.promise;
};


MonitoringDB.prototype.query = function(req, send, path) {
  var self = this;
  var deferred = Q.defer();
  if(self.isConnectedToDB_){
  	self.pool_.getConnection(function(err, connection){
      if(err) {
        throw err;
      }else{
        connection.query("use MonitoringDB");
        if(path){
            fs.unlink('monitoring.csv', function(err) {
              if (err) {
                   console.log(JSON.stringify(err));
              }
            });
            function processRow (first, second) {
              var file = path;//.replace(/.\//, '');
              fs.appendFile(file, first+","+second+"\n", function (err) {
                connection.resume();
              });
            }
            var query = connection.query(req);

            query.on('error', function(err) {
                    // do something when an error happens
            })
            .on('fields', function(fields) {
                //console.log("fields");
                //console.log(fields);
                //processRow(fields[0].name,fields[1].name);
            })
            .on('result', function(row) {
                 // Pausing the connnection is useful if your processing involves I/O
                 connection.pause();
                 var date=new Date(row.timestamp);
                 processRow(date, row.value, function (err) {
                   connection.resume();
                 });
             })
            .on('end', function() {
                  if(send){
                    send.file(path);
                  }
                  deferred.resolve();
            });
        }
        else{
            connection.query(req,  function(err, rows){
                if(err) {
                   throw err;
                }
                else{
                  if(send && send["json"]){
                    send.json(rows);
                  }
                  else{
                    //send = rows;
                  }
                  deferred.resolve(rows);
                }
            });
        }
        connection.release();
      }
    });
  }
  else{
      if(send){
        send.json(createError("Error: The connection is not correctly initialized!"));
      }
      deferred.reject(createError("Error: The connection is not correctly initialized!"));
  }
  return deferred.promise;
};
