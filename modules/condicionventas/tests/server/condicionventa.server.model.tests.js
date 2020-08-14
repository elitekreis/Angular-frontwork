'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Condicionventa = mongoose.model('Condicionventa');

/**
 * Globals
 */
var user, condicionventa;

/**
 * Unit tests
 */
describe('Condicionventa Model Unit Tests:', function() {
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
			condicionventa = new Condicionventa({
				name: 'Condicionventa Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return condicionventa.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			condicionventa.name = '';

			return condicionventa.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Condicionventa.remove().exec(function(){
			User.remove().exec(function(){
				done();
			});	
		});
	});
});
