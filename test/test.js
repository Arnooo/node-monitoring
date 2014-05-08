var assert = require("assert"),
    sinon = require("sinon"),
    monitoring = require("../monitoring");

//--------------------------------------------------------------------------------
// test cases - testing monitoring initialization
//
describe('W1bus', function(){
  describe('#create()', function(){
    it('should return an object correctly initialized!', function(done){
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
describe('W1bus', function(){
  describe('#create()', function(){
    it('should return an error because of wrong config!', function(done){
      var fackConfig={};
      var monitor = monitoring.create().initWithConfig(fackConfig)
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
  });
});


