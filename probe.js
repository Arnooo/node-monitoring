var util = require("util");
var events = require("events");

/**
 * Create Probe object and return it
 *
 * @param {Object} config
 * @api public
 */
exports.create = function(config){
	return new Probe(config);
};

/**
 * Probe constructor.
 *
 * @param {Object} config
 * @api public
 */
function Probe (config) {
	var self = this;
	console.log("Create new probe");
	//	console.log(config);
	//Inheritance
	self.eventEmitter_ = new events.EventEmitter;

	//Default config initialization
	self.timeout_=1000;
	self.isRunning_=false;

	//Others initialization
	self.timer_=null;

	//Set Config parameters
	//this.timeout_= 1000*config.frequency_hz;
	self.node_module_ = config.node_module;
	self.isRunning_ = config.probe_is_running;
	self.probeUID_ = config.probe_uid;
	self.configUID_ = config.probe_config_uid;
	self.historyTableUID_ = config.probe_history_table_uid;

	//Load node module managing this probe
	if(self.node_module_ === "fack-sensor"){
		self.sensor_ = require(__dirname+"/"+self.node_module_).create();
	}
	else
	{
		self.sensor_ = require(self.node_module_).create();
	}

	//Starting probe if necessary
	if(self.isRunning_){
		self.start();
	}
};

Probe.prototype.start = function(){
	var self = this;
	console.log("start probe");
	self.isRunning_ = true;
	self.timer_ = setInterval(function() {
		self.exec();
	}, self.timeout_);
};

Probe.prototype.stop = function(){
	var self = this;
	self.isRunning_ = false;
	clearInterval(self.timer_);
};

Probe.prototype.isRunning = function(){
	return this.isRunning_;
};

Probe.prototype.exec = function(){
	console.log("getting probe value");

	var self = this;
	if(self.sensor_){
		self.sensor_.isConnected()
		.then(function(){
			self.sensor_.getValue(function(data){
				data.probe_config_uid = self.configUID_;
				data.probe_history_table_uid = self.historyTableUID_;
				self.eventEmitter_.emit('eventNewValue', data);	
			});
		})
		.catch(function(err){
			//todo manage error
		});
	}
	else{
		self.stop();
		var data = {
			'status':false,
			'probe_uid':self.probeUID_,
			'probe_config_uid':self.configUID_,
			'probe_history_table_uid':self.historyTableUID_
		};
		self.eventEmitter_.emit('eventConnected', data);	
		console.error("Error: Probe disconnected, we stop it!");
	}
};

Probe.prototype.watch = function(){
	//return this.isRunning_;
};
