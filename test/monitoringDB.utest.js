var assert = require("assert"),
    sinon = require("sinon"),
    monitoringDB = require("../monitoringDB");

//--------------------------------------------------------------------------------
// test cases - testing monitoring initialization
//
describe('Monitoring DB: normal cases', function(){

    var conf={"db_host":"127.0.0.1","db_user":"root","db_password":"bestpasswordever"};
    var monitorDB = monitoringDB.create(conf);

    describe('#create()', function(){
        it('should return an initialized object!', function(){
            monitorDB = monitoringDB.create(conf);  
            assert.equal(monitorDB.config_.host, conf.db_host);
            assert.equal(monitorDB.config_.user, conf.db_user);
            assert.equal(monitorDB.config_.password, conf.db_password);
            assert.equal(monitorDB.config_.connectTimeout, 1000);
            assert.equal(monitorDB.isConnectedToDB_, false);
        });
    });
/*  
TODO:
** Mock MonitoringDB Required
monitoringDB.init
monitoringDB.isConnectedToDB
monitoringDB.isConnected_
monitoringDB.isDatabaseExist_
monitoringDB.createDB
monitoringDB.query
*/

});


//--------------------------------------------------------------------------------
// test cases - testing for failure
//
describe('MonitoringDB: failure cases', function(){
    var conf={"db_host":"127.0.0.1","db_user":"root","db_password":"bestpasswordever"};
    var monitorDB = monitoringDB.create(conf);

});


