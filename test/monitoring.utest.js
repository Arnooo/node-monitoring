var assert = require("assert"),
    sinon = require("sinon"),
    monitoring = require("../monitoring");
console.log("NODE_ENV : "+process.env.NODE_ENV);

var config = require('config');
// config now contains your actual configuration values as determined by the process.env.NODE_ENV
console.log("db_password : "+config.db_password);

var confTravisRoot=config;
//--------------------------------------------------------------------------------
// test cases - testing monitoring initialization
//
describe('Monitoring: normal cases', function(){
    //monitoring.useMock();
    var monitor = monitoring.create();

/*  beforeEach(function(done){
    var conf={"db_host":"127.0.0.1","db_user":"root","db_password":"bestpasswordever"};
    monitor.initWithConfig(conf)
    .then(function(){
      done();
    })
    .done(null, done);
  });*/

/*  afterEach(function(done){
    var conf={"db_host":"127.0.0.1","db_user":"root","db_password":"bestpasswordever"};
    monitor.initWithConfig(conf)
    .then(function(){
      done();
    })
    .done(null, done);
  });*/

  describe('#initWithConfig()', function(){
    it('should return a Monitoring object correctly initialized!', function(done){
      monitor.initWithConfig()
      .then(function(data){
          assert.equal(data.msg, "Success: Monitoring initialized!");
          done();
      })
      .catch(function(err){
        done(err);
      })
      .done(null, done);  
    });
  });

  describe('#init()', function(){
    it('should init the monitoring object!', function(done){
      monitor.init()
      .then(function(data){
          assert.equal(data.msg, "Success: Database connection successful!");
          done();
      })
      .catch(function(err){
        done(err);
      })
      .done(null, done);  
    });
  });

  describe('#setConfig()', function(){
    it('should set a new config if valid and reinit the monitoring object!', function(done){
      //we reset previous config
      monitor.config_ = null;
      var req_mock = {};
      var myRes = {
        write:function(data){},
        end:function(){}
      };
      var res_mock = sinon.mock(myRes);
      //res_mock.expects("write").atLeast(1).withArgs(JSON.stringify({monitoring:true}));
      //res_mock.expects("end").atLeast(1);

      monitor.process("setConfig", req_mock, myRes, confTravisRoot)
      .then(function(data){
        assert.ok(data);
        done();
      })
      .done(null, done);  
      res_mock.verify();
    });
  });

  describe('#validateConfig_()', function(){
    it('should return a msg to confirm the configuration validity', function(done){
      var conf=monitor.config_;
      monitor.validateConfig_(confTravisRoot)
      .then(function(data){
          assert.equal(data.msg, "Success: Monitoring config validated!");
          done();
      })
      .catch(function(err){
        done(err);
      })
      .done(null, done);  
    });
  });

  describe('#getConfig()', function(){
    it('should return a valid config!', function(done){
      monitor.clear();
      monitor.config_=confTravisRoot;
      monitor.validateConfig_(monitor.getConfig())
      .then(function(data){
          assert.equal(data.msg, "Success: Monitoring config validated!");
          done();
      })
      .catch(function(err){
        done(err);
      })
      .done(null, done);  
    });
  });

  describe('#process()', function(){
    it('should call the given callback and send a response back!', function(){
      monitor.clear();
      monitor.config_=confTravisRoot;
      var req_mock = {};
      var myRes = {
        write:function(data){},
        end:function(){}
      };
      var res_mock = sinon.mock(myRes);
      res_mock.expects("write").atLeast(1);
      res_mock.expects("end").atLeast(1);

      assert.ok(monitor.process("getConfig", req_mock, myRes)); 
      res_mock.verify();
    });
  });

/*  
TODO:

** Real MonitoringDB required
getProbeHistory
getProbes
getProbeConfig
getProbeAcquMode
getProbesManagement
changeProbeStatus


*/
});


//--------------------------------------------------------------------------------
// test cases - testing for failure
//
describe('Monitoring: failure cases', function(){
  var monitor = monitoring.create();

  describe('#initWithConfig()', function(){
    it('should return an error because of wrong config!', function(done){
      var fackConfig={};
       monitor.initWithConfig(fackConfig)
      .then(function(data){
          throw new Error("You should not succeed!");
          done();
      })
      .catch(function(err){
        assert.equal(err.message, "Error: Monitoring config not valid!");
        done();
      })
      .done(null, done);

    });

    it('should not be able to reach the database server!', function(done){
      var fackConfig={"db_host":"127.0.0.127","db_user":"root","db_password":"bestpasswordever"};
      monitor.initWithConfig(fackConfig)
      .then(function(data){
          throw new Error("You should not succeed!");
          done();
      })
      .catch(function(err){
        console.log(err);
        assert.equal(err.message, "Error: Cannot connect to the database!");
        done();
      })
      .done(null, done);

    });

    it('should not be able to connect to the database, its not a correct user!', function(done){
      var fackConfig={"db_host":"127.0.0.1","db_user":"","db_password":""};
      monitor.initWithConfig(fackConfig)
      .then(function(data){
          throw new Error("You should not succeed!");
          done();
      })
      .catch(function(err){
        console.log(err);
        assert.equal(err.message, "Error: Monitoring config not valid!");
        done();
      })
      .done(null, done);

    });

/*    it('should not be able to connect to the database, you did not protect your root access with a password!', function(done){
      var fackConfig={"db_host":"127.0.0.1","db_user":"root","db_password":""};
      monitor.initWithConfig(fackConfig)
      .then(function(data){
          throw new Error("You should not succeed!");
          done();
      })
      .catch(function(err){
        console.log(err);
        assert.equal(err.message, "Error: Monitoring config not valid!");
        done();
      })
      .done(null, done);

    });*/
  });

  describe('#process()', function(){
    it('should fail because the callback does not exist!', function(){
      assert.throws(monitor.process());
    });
  });
});


