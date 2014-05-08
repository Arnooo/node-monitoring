var assert = require("assert"),
    sinon = require("sinon"),
    fackSensor = require("../fack-sensor");

//--------------------------------------------------------------------------------
// test cases - testing probe normal cases
//
describe('Fack sensor: normal cases', function(){
    var fack = fackSensor.create(); 

    describe('#getConfig()', function(){
        it('should return a config matching\n'+    
            'var config = {\n'+
            '  sensor_id: {\n'+
            '    description: \"desc\",\n'+
            '    measures: {\n'+
            '      temperature: {\n'+
            '        description: \"Temperature measure\",\n'+
            '        pattern: /t=(\d+)/,\n'+
            '        unit: \"°C\",\n'+
            '        scale: 0.001\n'+
            '      }\n'+
            '    }\n'+
            '  }\n'+
            '}!',
        function(){
          var config = fack.getConfig();
          for(var sensor in config){
            console.log("Sensor ID = "+sensor);
            for(var param1 in config[sensor]){
                assert.ok((param1 === "description" ||
                          param1 === "measures"),
                           "Unknown sensor parameter: "+param1);
            }
            assert.ok(config[sensor].measures);
            for(var meas in config[sensor].measures){
              for(var param2 in config[sensor].measures[meas]){
                  assert.ok((param2 === "description" ||
                            param2 === "pattern" ||
                            param2 === "unit" ||
                            param2 === "scale"),
                             "Unknown measure parameter: "+param2);
              }
              console.log("Measure = "+meas);
              assert.ok(config[sensor].measures[meas].description);
              assert.ok(config[sensor].measures[meas].pattern);
              assert.ok(config[sensor].measures[meas].unit);
              assert.ok(config[sensor].measures[meas].scale);
            }
          }
        });
    });

    describe('#listAllSensors()', function(){
        it('should be a list with at least one sensor ID!', function(done){
            fack.listAllSensors()
            .then(function(data){
                try{
                    assert.ok(data.ids.length >= 1);
                    done();
                }
                catch(err){
                    done(err);
                }
            })
            .catch(function(err){
                done(err);
            })    
            .done(null, done);
        });
    });

    describe('#getValueFrom()', function(){
        it('should return an object with a timestamp and a value, corresponding to a sensors value at a datetime.', function(done){
            fack.listAllSensors()
            .then(function(data){
                try{
                    assert.ok(data.ids.length >= 1);

                    fack.getValueFrom(data.ids[0])
                    .then(function(res){
                        try{
                            assert.ok(!isNaN(res.value));
                            assert.equal(typeof(1), typeof(res.value));
                            assert.ok(!isNaN(res.timestamp));
                            assert.equal(typeof(1), typeof(res.timestamp));
                            assert.ok(res.timestamp > 0);
                            console.log("Date = "+new Date(res.timestamp)+", Value = "+res.value);

                            done();
                        }
                        catch(err){
                            done(err);
                        }
                    })
                    .catch(function(err){
                        done(err);
                    })
                    .done(null, done);
                }
                catch(err){
                    done(err);
                }
            })
            .catch(function(err){
                done(err);
            })
            .done(null, done);
        });
    });

    describe('#isConnected()', function(){
        it('should be connected!', function(done){
            fack.listAllSensors()
            .then(function(data){
                console.log("Check connection for sensor "+data.ids[0]);
                fack.isConnected(data.ids[0])
                .then(function(data){
                    assert.ok(data.connected);
                    done();
                })
                .catch(function(err){
                    done(err);
                });
            })
            .catch(function(err){
                done(err);
            })    
            .done(null, done);
        });
    });
});


//--------------------------------------------------------------------------------
// test cases - testing for failure
//
describe('Fack sensor: failure cases', function(){

});


