/*!
 * Monitoring
 * Copyright(c) 2014 Arnaud Jouobel <arnaud.joubel@gmail.com>
 * MIT Licensed
 */

 /**
 * Module dependencies.
 */
var Q = require('q');


/**
 * Create FackSensor object and return it
 *
 * @api public
 */
exports.create = function() {
    return new FackSensor();
};

/**
 * FackSensor constructor.
 *
 * @api public
 */
function FackSensor () {
    var self=this;
    self.sensors_= ['fackSensor'];
    /**
     * Sensor's config
     *
     var config = {
        sensor_id: {
            description: "desc",
            measures: {
                measure_type: {
                    description: "Measure description",
                    pattern: /value=(\d+)/,
                    unit: "°C",
                    scale: 0.001
                }
            }
        }
     }
     */
    self.config_ = {
        fackSensor: { 
            description: "This is a fack sensor.",
            measures:{
                temperature: {
                    description: "Temperature",
                    pattern: /t=(\d+)/,
                    unit:"°C",
                    scale: 0.001
                },
                humidity: {
                    description: "Humidity",
                    pattern: /h=(\d+)/,
                    unit:"%",
                    scale: 0.001
                }
            }
        }
    };
};

/**
 * Return module config used by node-monitoring module
 *
 * @api public
 */
FackSensor.prototype.getConfig = function() {
    var self=this;
    return self.config_;
};

/**
 *  Check if given sensors id is connected/available
 *
 * @param {Object} sensor ID
 * @api public
 */
FackSensor.prototype.isConnected = function(sensorID) {
    var self=this;
    var deferred = Q.defer(); 
    deferred.resolve({connected:true});
    return deferred.promise;
};

/**
 * List all fack sensors available
 * Return a promise (idsList)
 *
 * @api public
 */
FackSensor.prototype.listAllSensors = function() {
    var self=this;
    var deferred = Q.defer(); 
    deferred.resolve({ids:self.sensors_});
    return deferred.promise;
};

/**
 * Get value from sensor
 * Return a promise (result{timestamp, value})
 *
 * @param {Object} sensor ID
 * @param {Object} optional measure type, such as 'temperature'
 * @api public
 */
FackSensor.prototype.getValueFrom = function(sensorID, opt_measureType) {
    var self=this;
    var deferred = Q.defer(); 
    var randValue= (Math.random().toFixed(2)*20)+10;  
    var result = {
        timestamp: Date.now(),
        value: randValue
    };
    deferred.resolve(result);   
    return deferred.promise;
};




