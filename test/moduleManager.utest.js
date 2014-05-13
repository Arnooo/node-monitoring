var assert = require("assert"),
    sinon = require("sinon"),
    moduleManager = require("../moduleManager");


//--------------------------------------------------------------------------------
// test cases - testing moduleManager normal cases
//
describe('Module manager: normal cases', function(){
    var mgr = moduleManager.create();

    describe('#create()', function(){
        it('should return an object!', function(){
            assert.equal(typeof(mgr), typeof({}));
        });

        it('should be empty before init!', function(){
            assert.ok(!mgr.moduleCompatibleInstalled_['q']);
        });

        it('should be compatible with node-w1bus module of version >= 0.1.2!', function(){
            assert.ok(mgr.moduleCompatible_['node-w1bus'] >= '0.1.2');
        });   
    });

    describe('#init()', function(){
        it('should return an initialized object, including Q dependencie!', function(done){
            mgr.init()
            .then(function(){
                assert.ok(mgr.moduleCompatibleInstalled_['q']);
                done();
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
describe('Module manager: failure cases', function(){

});


