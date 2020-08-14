'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Rrhh = mongoose.model('Rrhh'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, rrhh;

/**
 * Rrhh routes tests
 */
describe('Rrhh CRUD tests', function() {
	before(function(done) {
		// Get application
		app = express.init(mongoose);
		agent = request.agent(app);

		done();
	});

	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Rrhh
		user.save(function() {
			rrhh = {
				name: 'Rrhh Name'
			};

			done();
		});
	});

	it('should be able to save Rrhh instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Rrhh
				agent.post('/api/rrhhs')
					.send(rrhh)
					.expect(200)
					.end(function(rrhhSaveErr, rrhhSaveRes) {
						// Handle Rrhh save error
						if (rrhhSaveErr) done(rrhhSaveErr);

						// Get a list of Rrhhs
						agent.get('/api/rrhhs')
							.end(function(rrhhsGetErr, rrhhsGetRes) {
								// Handle Rrhh save error
								if (rrhhsGetErr) done(rrhhsGetErr);

								// Get Rrhhs list
								var rrhhs = rrhhsGetRes.body;

								// Set assertions
								(rrhhs[0].user._id).should.equal(userId);
								(rrhhs[0].name).should.match('Rrhh Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Rrhh instance if not logged in', function(done) {
		agent.post('/api/rrhhs')
			.send(rrhh)
			.expect(403)
			.end(function(rrhhSaveErr, rrhhSaveRes) {
				// Call the assertion callback
				done(rrhhSaveErr);
			});
	});

	it('should not be able to save Rrhh instance if no name is provided', function(done) {
		// Invalidate name field
		rrhh.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Rrhh
				agent.post('/api/rrhhs')
					.send(rrhh)
					.expect(400)
					.end(function(rrhhSaveErr, rrhhSaveRes) {
						// Set message assertion
						(rrhhSaveRes.body.message).should.match('Please fill Rrhh name');
						
						// Handle Rrhh save error
						done(rrhhSaveErr);
					});
			});
	});

	it('should be able to update Rrhh instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Rrhh
				agent.post('/api/rrhhs')
					.send(rrhh)
					.expect(200)
					.end(function(rrhhSaveErr, rrhhSaveRes) {
						// Handle Rrhh save error
						if (rrhhSaveErr) done(rrhhSaveErr);

						// Update Rrhh name
						rrhh.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Rrhh
						agent.put('/api/rrhhs/' + rrhhSaveRes.body._id)
							.send(rrhh)
							.expect(200)
							.end(function(rrhhUpdateErr, rrhhUpdateRes) {
								// Handle Rrhh update error
								if (rrhhUpdateErr) done(rrhhUpdateErr);

								// Set assertions
								(rrhhUpdateRes.body._id).should.equal(rrhhSaveRes.body._id);
								(rrhhUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Rrhhs if not signed in', function(done) {
		// Create new Rrhh model instance
		var rrhhObj = new Rrhh(rrhh);

		// Save the Rrhh
		rrhhObj.save(function() {
			// Request Rrhhs
			request(app).get('/api/rrhhs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Rrhh if not signed in', function(done) {
		// Create new Rrhh model instance
		var rrhhObj = new Rrhh(rrhh);

		// Save the Rrhh
		rrhhObj.save(function() {
			request(app).get('/api/rrhhs/' + rrhhObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', rrhh.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Rrhh instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Rrhh
				agent.post('/api/rrhhs')
					.send(rrhh)
					.expect(200)
					.end(function(rrhhSaveErr, rrhhSaveRes) {
						// Handle Rrhh save error
						if (rrhhSaveErr) done(rrhhSaveErr);

						// Delete existing Rrhh
						agent.delete('/api/rrhhs/' + rrhhSaveRes.body._id)
							.send(rrhh)
							.expect(200)
							.end(function(rrhhDeleteErr, rrhhDeleteRes) {
								// Handle Rrhh error error
								if (rrhhDeleteErr) done(rrhhDeleteErr);

								// Set assertions
								(rrhhDeleteRes.body._id).should.equal(rrhhSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Rrhh instance if not signed in', function(done) {
		// Set Rrhh user 
		rrhh.user = user;

		// Create new Rrhh model instance
		var rrhhObj = new Rrhh(rrhh);

		// Save the Rrhh
		rrhhObj.save(function() {
			// Try deleting Rrhh
			request(app).delete('/api/rrhhs/' + rrhhObj._id)
			.expect(403)
			.end(function(rrhhDeleteErr, rrhhDeleteRes) {
				// Set message assertion
				(rrhhDeleteRes.body.message).should.match('User is not authorized');

				// Handle Rrhh error error
				done(rrhhDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Rrhh.remove().exec(function(){
				done();
			});
		});
	});
});
