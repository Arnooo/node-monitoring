var assert = require("assert"),
    sinon = require("sinon"),
    monitoring = require("../monitoring");

//--------------------------------------------------------------------------------
// test cases - testing monitoring initialization
//
describe('Monitoring: normal cases', function(){
  describe('#initWithConfig()', function(){
    it('should return a Monitoring object correctly initialized!', function(done){
      var monitor = monitoring.create().initWithConfig()
      .then(function(data){
          assert.equal(data.msg, "Success: Monitoring initialized!");
          done();
      })
      .catch(function(err){
        done(err);
      })
      .done(null, done);  
    });

/*    it("should init the monitoring database connexion!", function () {
        var monitor = monitoring.create();

        assert.equals(proxy(), "Database connection successful!");
    });*/
  });
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

    it('should not be able to connect to the database, you did not protect your root access with a password!', function(done){
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

    });
  });
});


