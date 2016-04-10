var FSM = require('./../thingamabob.js');
var chai = require('chai');
var assert = chai.assert;
var should = chai.should();

describe('FSM transitions', function() {

  var fsm;

  beforeEach(function() {
    fsm = new FSM({
      initial : 'green',
      states  : {
        green : ['red'],
        red   : ['green'],
      }
    });
  });

  it('updates the current state on transitions', function() {
    fsm.current.should.equal('green');
    fsm.go('red');
    fsm.current.should.equal('red');
  });

  it('emits an event when changing to the next state', function(done) {
    fsm.on('red', function() { done() });
    fsm.go('red');
  });

  it('emits an exit event from the previous state containing the next state on a legal transition', function(done) {
    fsm.on('after:green', function(next) {
      next.should.equal('red');
      done();
    });
    fsm.go('red');
  });

  it('emits an enter event containing the previous state before state is changed', function(done) {
    fsm.on('before:red', function(prev) {
      prev.should.equal('green');
      done();
    });
    fsm.go('red');
  });

  it('changes the state after the "after:" and "before:" events but before the main event', function(done) {
    fsm.on('after:green', function() {
      fsm.current.should.equal('green');
    });
    fsm.on('before:red', function() {
      fsm.current.should.equal('green');
    });
    fsm.on('red', function() {
      fsm.current.should.equal('red');
      done();
    });
    fsm.go('red');
  });

  it('emits an error event if a transition is not allowd from the current state', function(done) {
    fsm.on('error', function(error, prev, attempted) {
      error.name.should.equal('IllegalTransitionException');
      error.message.should.not.equal(undefined);
      prev.should.equal('green');
      attempted.should.equal('green');
      done();
    });
    fsm.go('green');
  });

  it('throws error if an illegal transition is attempted and there is no error callback', function() {
    try {
      fsm.go('green');
    } catch(e) {
      e.name.should.equal('IllegalTransitionException');
      e.message.should.not.equal(undefined);
    }
  });

  it('emits an error if an uncaught exception is thrown in a transition and an error callback is defined', function(done) {
    fsm.on('error', function(error) {
      error.message.should.equal('intentional');
      done();
    });
    fsm.on('red', function() {
      throw new Error('intentional');
    });
    fsm.go('red');
  });

  it('re-thows exceptions if an uncaught exception is thrown in a transition and there is no error callback', function() {
    fsm.on('red', function() {
      throw new Error('intentional');
    });
    try {
      fsm.go('red');
    } catch (e) {
      e.message.should.equal('intentional');
    }
  });
});
