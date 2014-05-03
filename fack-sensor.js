var fackSensor = function(processValue){
    var randValue= (Math.random().toFixed(2)*20)+10;
    var result = {
        timestamp: Date.now(),
        value: randValue
    };
    processValue(result);
};

exports.getValue = fackSensor;
exports.isConnected = function(){
    return true;
};