'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Costosindirecto = mongoose.model('Costosindirecto');

/**
 * Globals
 */
var user,
  costosindirecto;

/**
 * Unit tests
 */
describe('Costosindirecto Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      costosindirecto = new Costosindirecto({
        name: 'Costosindirecto Name',
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      this.timeout(0);
      return costosindirecto.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without name', function(done) {
      costosindirecto.name = '';

      return costosindirecto.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {
    Costosindirecto.remove().exec(function() {
      User.remove().exec(function() {
        done();
      });
    });
  });
});
