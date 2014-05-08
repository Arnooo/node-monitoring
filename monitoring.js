/*!
 * Monitoring
 * Copyright(c) 2014 Arnaud Jouobel <arnaud.joubel@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var zlib = require('zlib'),
    fs = require('fs'),
    Q = require('q');

/**
 * Version.
 */
exports.version = '0.1.0';

var io = require('socket.io').listen(8080);
io.sockets.on('connection', function (socket) {
    console.log("SOCKET CONNECTED");
});

/**
 * Create Monitoring object and return it
 *
 * @param {Object} req, request send from client
 * @param {Object} res, result send to client
 * @api public
 */
exports.create = function(config) {
    return new Monitoring(config);
};

/**
 * Send constructor.
 *
 * @param {Object} res
 * @api private
 */
function Send (res) {
    this.lastResult_ = res;
    console.log("Constructor: "+this.lastResult_);
};

/**
 * Send json data as answer
 *
 * @api private
 */
Send.prototype.json = function(rows) {
    console.log("send json:"+this.lastResult_);
    if(rows){
        console.log( rows );
        this.lastResult_.write(JSON.stringify(rows));
    }
    this.lastResult_.end();
};

/**
 * Send empty answer
 *
 * @api private
 */
Send.prototype.empty = function(rows) {
    this.lastResult_.end();
};

/**
 * Send file given in parameters
 *
 * @api private
 */
Send.prototype.file = function(path){
    var self = this;
    var compress = true;
    var file = fs.createReadStream(path);

    if(compress){
      file.pipe(zlib.createGzip()).pipe(self.lastResult_);
    }
    else{
      file.on('data', self.lastResult_.write.bind(self.lastResult_));
      file.on('close', function() {
        self.lastResult_.end();
      });
    }
    file.on('error', function(error) {
      //self.sendError_(req, res, error);zlib
    });
};

/**
 * Monitoring constructor.
 *
 * @api public
 */
function Monitoring(config){
  var self = this;
  self.initWithConfig(config);
}


Monitoring.prototype.initWithConfig = function(config) {
  var self = this;
  var deferred = Q.defer(); 
  if(!config){
    //read default config
    fs.readFile(__dirname+'/config.json', 'utf8', function (err,data) {
        if (err) {
          return console.error(err);
        }
        self.validateConfig_(JSON.parse(data))
        .then(function(){
          return self.init();
        })
        .then(function(){
            var msg = "Success: Monitoring initialized!";
            deferred.resolve({msg:msg});
            console.log(msg);
        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();
    });
  }
  else{
      self.validateConfig_(config)
      .then(function(){
        return self.init();
      })
      .then(function(){
          var msg = "Success: Monitoring initialized!";
          deferred.resolve({msg:msg});
          console.log(msg);
      })
      .catch(function(err){
          deferred.reject(err);
      })
      .done();
  }
  return deferred.promise;
};

Monitoring.prototype.validateConfig_ = function(config) {
    var self=this;
    var deferred = Q.defer(); 
    if(config.db_host && 
       config.db_user &&
       (config.db_password === "" || config.db_password)){
        self.config_=config;
        var msg = "Success: Monitoring config validated!";
        deferred.resolve({msg:msg});
        console.log(msg);
    }
    else{
        var msg = "Error: Monitoring config not valid!";
        deferred.reject(new Error(msg));
        console.error(msg);
    }
    return deferred.promise;
}

Monitoring.prototype.init = function() {
    var self=this;
    if(self.monitoringDB_){
      //clean
      self.monitoringDB_=null;
    }

    var deferred = Q.defer(); 
    self.errorOnInit_='';
    self.monitoringDB_ = require('./monitoringDB').create(self.config_);
    self.monitoringDB_.init()
    .then(function(){
      if(self.probesMgt_){
        self.probesMgt_.clean();
        self.probesMgt_=null;
      }
      self.probesMgt_ = require('./probesManagement').create(self.monitoringDB_, io);
      var msg = "Success: Database connection successful!";
      deferred.resolve({msg:msg});
      console.log(msg);
    })
    .catch(function(err){
      deferred.reject(err);
    });
    return deferred.promise;
};

/**
 * Process request: calling callback with optional data
 *
 * @param {String} callback
 * @param {Object} req
 * @param {Object} res
 * @param {Object} opt_data, optional
 * @api public
 */
Monitoring.prototype.process = function(callback, req, res, opt_data) {
    var self=this;
    if(req && res && callback && this[callback]){
        self.lastRequest_= req;
        self.send_ = new Send(res);
       // setTimeout(function() { //For debug purpose
              self[callback].apply(self, [self.lastRequest_, opt_data]);
       // }, 3000); 
    }
    else{
        console.error("Error: Try to access unknown function called: "+callback);
    }
};

Monitoring.prototype.setConfig = function(req, config) {
  var self = this;
  console.log('Set config : '+req);
  var backupConfig = self.config_;
  if(self.config_ != config){
    self.config_ = config;
    self.init()
    .then(function(){
      self.send_.json({monitoring:true});
      fs.writeFile(__dirname+'/config.json', JSON.stringify(self.config_), function (err,data) {
      if (err) {
        return console.error(err);
      }
      });
    })
    .catch(function(err){
      self.send_.json(err);
      self.config_=backupConfig;
    });
  }
};

Monitoring.prototype.getConfig = function(req) {
  var self = this;
  console.log('Get config : '+req);
  self.send_.json(self.config_);
};

Monitoring.prototype.getProbeHistory = function(req, path) {
    var self = this;
    if(req.url.query.historyTable){
        var queryStr="SELECT timestamp, value FROM "+req.url.query.historyTable+" ORDER BY timestamp ASC";
        console.log(queryStr);
        self.monitoringDB_.query(queryStr, self.send_, path);

       /* var queryStr="SELECT * FROM ProbesManagement";
        console.log(queryStr);
        self.monitoringDB_.query(queryStr)
        .then(function(data){
          if(data[0])
          {
            var queryStr="SELECT datetime, value FROM "+data[0].probe_history_table_uid+" ORDER BY datetime ASC";
            console.log(queryStr);
            self.monitoringDB_.query(queryStr, self.send_, path);
          }
        });*/
    }
};

Monitoring.prototype.getProbes = function(req) {
  console.log('Return probe list : '+req);
  var self = this;
  var queryStr="SELECT * FROM Probes ORDER BY probe_uid";
  console.log(queryStr);
  self.monitoringDB_.query(queryStr, self.send_);
};

Monitoring.prototype.getProbeConfig = function(req) {
  console.log('Return probe config: '+req);
  var self = this;
  var queryStr="SELECT * FROM (SELECT T2.*, T1.probe_config_uid FROM ProbesManagement AS T1 LEFT JOIN Probes AS T2 USING (probe_uid))T3 LEFT JOIN ProbeConfig AS T4 USING (probe_config_uid) WHERE probe_uid="+req.url.query.probeUID+" ORDER BY probe_config_uid";
  console.log(queryStr);
  self.monitoringDB_.query(queryStr, self.send_);

};

Monitoring.prototype.getProbeAcquMode = function(req) {
  console.log('Return probe acqu mode: '+req);
  var self = this;
  var queryStr="SELECT * FROM ProbeAcquMode ORDER BY probe_acqu_mode_uid";
  console.log(queryStr);
  self.monitoringDB_.query(queryStr, self.send_);
};

Monitoring.prototype.getProbesManagement = function(req) {
  console.log('Return probe management : '+req);
  var self = this;
  var queryStr="SELECT * FROM  (SELECT * FROM ProbesManagement AS T1 LEFT JOIN Probes AS T2 USING (probe_uid))Temp LEFT JOIN ProbeConfig AS T3 USING (probe_config_uid)";
  console.log(queryStr);
  self.monitoringDB_.query(queryStr, self.send_);

};

Monitoring.prototype.addProbe = function(req, data) {
    console.log('Add new probe: '+data.probe_name);
    var self = this;
    //validate new probe
    if(data.probe_name && data.description){
      //Add new probe to DB
      var queryStr="INSERT INTO Probes (probe_name, description) VALUES ('"+data.probe_name+"','"+data.description+"')";
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_)
      .then(function(){
          self.probesMgt_.initProbes();
      });
    }
};

Monitoring.prototype.updateProbe = function(req, data) {
    console.log('Update probe: '+data.probe_name);
    var self = this;
    //validate update probe
    if(data.probe_uid && data.probe_name && data.description){
      //update  probe to DB
      var queryStr="UPDATE Probes SET probe_name='"+data.probe_name+"', description='"+data.description+"' WHERE probe_uid="+data.probe_uid;
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_);
    }
};

Monitoring.prototype.rmProbe = function(req) {
    console.log('Remove probe: '+req.url.query.probeUID);
    var self = this;
    // options: - only in probe list 
    //          - config + in probe list
    //          - config + in probe list + history
    //validate probe
    if(req.url.query.probeUID){
        var queryStr="SELECT probe_history_table_uid FROM ProbesManagement WHERE probe_uid="+req.url.query.probeUID+" ";
        console.log(queryStr);
        self.monitoringDB_.query(queryStr)
        .then(function(data){
          console.log(data);
          var item = data[0];
          for (var i = 0, item; item = data[i]; i++) {
            //Remove probe config table
            var queryStr="DROP TABLE "+item.probe_history_table_uid;
            console.log(queryStr);
            self.monitoringDB_.query(queryStr);
          }
        })
        .then(function(){
            //Remove probe from DB
            var queryStr="DELETE FROM Probes USING Probes WHERE Probes.probe_uid="+req.url.query.probeUID+"";
            console.log(queryStr);
            self.monitoringDB_.query(queryStr, self.send_);
        });
    }
};

Monitoring.prototype.addProbeConfig = function(req, data) {
    console.log('Add new probe config: '+data.probe_type);
    var self = this;
    //validate new probe config
    if(data.probe_type && data.node_module && data.unit && req.url.query.probeUID){
      //Add new probe config to DB

      var probeTypeTrim = String(data.probe_type).replace(/ /g,'');
      var tableName = ''; 
      var id = ''; 
      var queryStr="INSERT INTO ProbeConfig (probe_type, node_module, unit) VALUES ('"+data.probe_type+"','"+data.node_module+"','"+data.unit+"')";
      console.log(queryStr);
      self.monitoringDB_.query(queryStr)
      .then(function(){
        queryStr="SELECT MAX(probe_config_uid) AS id FROM ProbeConfig";
        console.log(queryStr);
        return self.monitoringDB_.query(queryStr);
      })
      .then(function(data){
        if(data[0]){
          id = data[0].id;
          console.log("id="+id);
          tableName = probeTypeTrim+req.url.query.probeUID+id;
          queryStr="CREATE TABLE "+tableName+" (timestamp BIGINT PRIMARY KEY NOT NULL, value FLOAT NOT NULL)";
          console.log(queryStr);
          return self.monitoringDB_.query(queryStr);
        }
        else{
          queryStr = "";
          console.error("Error: cannot get id from previous query!");
        }
      })    
      .then(function(data){
          console.log("idProbesManagement="+id);
        queryStr="INSERT INTO ProbesManagement (probe_uid, probe_config_uid, probe_history_table_uid) VALUES ("+req.url.query.probeUID+","+id+", '"+tableName+"')";
        console.log(queryStr);
        return self.monitoringDB_.query(queryStr, self.send_);
      })
      .then(function(){
          self.probesMgt_.initProbes();
      });
    }
};

Monitoring.prototype.updateProbeConfig = function(req, data) {
    console.log('Update probe config: '+data.probe_type);
    var self = this;
    //validate update probe config
    if(data.probe_type && data.unit && data.node_module && data.probe_config_uid){
      //update probe config to DB
      var queryStr="UPDATE ProbeConfig SET probe_type='"+data.probe_type+"', unit='"+data.unit+"', node_module='"+data.node_module+"' WHERE probe_config_uid="+data.probe_config_uid;
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_);
    }
};

Monitoring.prototype.rmProbeConfig = function(req) {
    console.log('Remove probe config: '+req.url.query.probeConfigUID);
    var self = this;
    //validate probe config
    if(req.url.query.probeConfigUID){
      var queryStr="SELECT probe_history_table_uid FROM ProbesManagement WHERE probe_config_uid="+req.url.query.probeConfigUID+" ";
      console.log(queryStr);
      self.monitoringDB_.query(queryStr)
      .then(function(data){
          console.log(data);
          var item = data[0];
          for (var i = 0, item; item = data[i]; i++) {
            //Remove probe config table
            var queryStr="DROP TABLE "+item.probe_history_table_uid;
            console.log(queryStr);
            self.monitoringDB_.query(queryStr);
          }
      })
      .then(function(){
        //Remove probe config from DB
        var queryStr="DELETE FROM ProbeConfig WHERE ProbeConfig.probe_config_uid="+req.url.query.probeConfigUID+" ";
        console.log(queryStr);
        self.monitoringDB_.query(queryStr, self.send_);
      });
    }
};

Monitoring.prototype.addProbeAcquMode = function(req, data) {
    console.log('Add new probe acqu mode: '+data.acquisition_mode_name);
    var self = this;
    //validate new probe
    if(data.acquisition_mode && data.acquisition_mode_name){
      //Add new probe to DB
      var queryStr="INSERT INTO ProbeAcquMode (acquisition_mode_name, acquisition_mode) VALUES ('"+data.acquisition_mode_name+"','"+data.acquisition_mode+"')";
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_);
    }
};

Monitoring.prototype.rmProbeAcquMode = function(req) {
    console.log('Remove probe acqu mode: '+req.url.query.probeAcquModeUID);
    var self = this;

    //validate probe acqu mode
    if(req.url.query.probeAcquModeUID){
      //Remove probe config from DB
      var queryStr="DELETE FROM ProbeAcquMode WHERE ProbeAcquMode.probe_acqu_mode_uid="+req.url.query.probeAcquModeUID+" ";
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_);
    }
};

Monitoring.prototype.updateProbeAcquMode = function(req, data) {
    console.log('Update probe acqu mode: '+data.acquisition_mode_name);
    var self = this;
    //validate update probe acqu mode
    if(data.acquisition_mode_name && data.acquisition_mode && data.frequency_hz && data.probe_acqu_mode_uid){
      //update probe acqu mode to DB
      var queryStr="UPDATE ProbeAcquMode SET acquisition_mode_name='"+data.acquisition_mode_name+"', acquisition_mode='"+data.acquisition_mode+"', frequency_hz='"+data.frequency_hz+"' WHERE probe_acqu_mode_uid="+data.probe_acqu_mode_uid;
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_);
    }
};

Monitoring.prototype.linkAcquModeToConfig = function(req) {
    console.log('Link probe acqu mode: '+req.url.query.probeAcquModeUID+' to probe config: '+req.url.query.probeConfigUID);
    var self = this;
    //validate data
    if(req.url.query.probeAcquModeUID && req.url.query.probeConfigUID){
      //link data
      var queryStr="UPDATE ProbeConfig SET probe_acqu_mode_uid='"+req.url.query.probeAcquModeUID+"' WHERE probe_config_uid="+req.url.query.probeConfigUID;
      console.log(queryStr);
      self.monitoringDB_.query(queryStr, self.send_);
    }
};

Monitoring.prototype.changeProbeStatus = function(req, data) {
    var self = this;
    console.log('Change probe status: Probe_uid='+data.probe_uid+', Probe_config_uid='+data.probe_config_uid+', status='+data.status);
    if(data.probe_uid && data.probe_config_uid && data.status !== undefined){
      this.probesMgt_.setProbeStatus(data.probe_uid, data.probe_config_uid, data.status, self.send_);
    }
};

Monitoring.prototype.createDB = function() {
    var self = this;
    if(self.monitoringDB_){
      self.monitoringDB_.createDB()
      .then(function(){
          self.init()
          .then(function(){
            self.send_.json({monitoring:true});
          })
          .catch(function(err){
            self.send_.json(err);
          });
      })
      .catch(function(err){
        self.send_.json(err);
      });
    }
};






