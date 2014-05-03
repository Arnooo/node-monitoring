/*!
 * Monitoring
 * Copyright(c) 2014 Arnaud Jouobel <arnaud.joubel@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
 var probe = require('./probe'),
 	 Q = require('q');

/**
 * Create ProbesManagement object and return it
 *
 * @api public
 */
exports.create = function(monitoringDB, io) {
	return new ProbesManagement(monitoringDB, io);
};

/**
 * ProbesManagement constructor.
 *
 * @api public
 */
function ProbesManagement(monitoringDB,io){
    var self=this;
    self.monitoringDB_=monitoringDB;
    self.io_=io;
 	self.probes = {}; // {probe_uid : { probe_config_uid_1: new Probe, probe_config_uid2: new Probe}}
 	self.initProbes();
};

ProbesManagement.prototype.clean = function() {
    var self = this;
    for (var p in self.probes) {
        for (var c in self.probes[p]) {
            self.probes[p][c].stop();
        }
    }
    self.probes={};
};

ProbesManagement.prototype.initProbes = function() {
    var self = this;
    var queryStr="SELECT * FROM  (SELECT * FROM ProbesManagement AS T1 LEFT JOIN Probes AS T2 USING (probe_uid))Temp LEFT JOIN ProbeConfig AS T3 USING (probe_config_uid)";
    console.log(queryStr);
    self.monitoringDB_.query(queryStr)
    .then(function (data){
        console.log("Init probes management!!");
        var item = data[0];
        for (var i = 0, item; item = data[i]; i++) {
            if(!self.probes[item.probe_uid]){
                self.probes[item.probe_uid]={};
            }
            var p = probe.create(item);
            p.eventEmitter_.on('eventNewValue', function(data) { 
                console.log("eventNewValue: "+data.value+" "+data.probe_config_uid );
                if(data.timestamp && data.value){
                  var table = data.probe_history_table_uid;
                  /*var date = new Date(data.datetime);
                  var dateFormat = date.toISOString().replace(/Z/g, "");*/
                  var queryStr="INSERT INTO "+table+" (timestamp, value) VALUES ("+data.timestamp+","+data.value+")";
                  console.log("eventNewValue: "+queryStr);
                  self.monitoringDB_.query(queryStr);
                  self.io_.sockets.emit('newValue', data);
                }
            });
            p.eventEmitter_.on('eventConnected', function(data) { 
                console.log("eventConnected: "+data);
                //save in db
                var queryStr="UPDATE ProbesManagement SET probe_is_connected="+data.status+", probe_is_running=IF("+data.status+",probe_is_running,false) WHERE probe_config_uid="+data.probe_config_uid+" AND probe_uid="+data.probe_uid;
                console.log(queryStr);
                self.monitoringDB_.query(queryStr)
                .then(function(){
                    self.io_.sockets.emit('refreshProbes');
                });
            });
            //console.log(p);
            //console.log("PPPPp>>>"+JSON.stringify(p));
            self.probes[item.probe_uid][item.probe_config_uid] = p;
        }
        //console.log("Probes>"+JSON.stringify(self.probes));
    });
};

ProbesManagement.prototype.getProbeStatus = function(probe_uid, probe_config_uid) {
    var self = this;
    var status = false;
    if(probe_uid && probe_config_uid &&
       self.probes[probe_uid] && self.probes[probe_uid][probe_config_uid]){
        status = self.probes[probe_uid][probe_config_uid].isRunning();
    }
    return status;
};

ProbesManagement.prototype.setProbeStatus = function(probe_uid, probe_config_uid, status, opt_send) {
    var self = this;
    if(probe_uid && probe_config_uid && status !== undefined &&
       self.probes[probe_uid] && self.probes[probe_uid][probe_config_uid]){
        console.log("status="+status);
        if(status){
            self.probes[probe_uid][probe_config_uid].start();
        }
        else{
            self.probes[probe_uid][probe_config_uid].stop();
        }
        //save in db
        var queryStr="UPDATE ProbesManagement SET probe_is_running="+status+" WHERE probe_config_uid="+probe_config_uid+" AND probe_uid="+probe_uid;
        console.log(queryStr);
        self.monitoringDB_.query(queryStr, opt_send);
    }
};

