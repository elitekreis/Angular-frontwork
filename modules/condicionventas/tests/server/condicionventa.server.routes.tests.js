'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Condicionventa = mongoose.model('Condicionventa'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, condicionventa;

/**
 * Condicionventa routes tests
 */
describe('Condicionventa CRUD tests', function() {
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

		// Save a user to the test db and create new Condicionventa
		user.save(function() {
			condicionventa = {
				name: 'Condicionventa Name'
			};

			done();
		});
	});

	it('should be able to save Condicionventa instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Condicionventa
				agent.post('/api/condicionventas')
					.send(condicionventa)
					.expect(200)
					.end(function(condicionventaSaveErr, condicionventaSaveRes) {
						// Handle Condicionventa save error
						if (condicionventaSaveErr) done(condicionventaSaveErr);

						// Get a list of Condicionventas
						agent.get('/api/condicionventas')
							.end(function(condicionventasGetErr, condicionventasGetRes) {
								// Handle Condicionventa save error
								if (condicionventasGetErr) done(condicionventasGetErr);

								// Get Condicionventas list
								var condicionventas = condicionventasGetRes.body;

								// Set assertions
								(condicionventas[0].user._id).should.equal(userId);
								(condicionventas[0].name).should.match('Condicionventa Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Condicionventa instance if not logged in', function(done) {
		agent.post('/api/condicionventas')
			.send(condicionventa)
			.expect(403)
			.end(function(condicionventaSaveErr, condicionventaSaveRes) {
				// Call the assertion callback
				done(condicionventaSaveErr);
			});
	});

	it('should not be able to save Condicionventa instance if no name is provided', function(done) {
		// Invalidate name field
		condicionventa.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Condicionventa
				agent.post('/api/condicionventas')
					.send(condicionventa)
					.expect(400)
					.end(function(condicionventaSaveErr, condicionventaSaveRes) {
						// Set message assertion
						(condicionventaSaveRes.body.message).should.match('Please fill Condicionventa name');
						
						// Handle Condicionventa save error
						done(condicionventaSaveErr);
					});
			});
	});

	it('should be able to update Condicionventa instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Condicionventa
				agent.post('/api/condicionventas')
					.send(condicionventa)
					.expect(200)
					.end(function(condicionventaSaveErr, condicionventaSaveRes) {
						// Handle Condicionventa save error
						if (condicionventaSaveErr) done(condicionventaSaveErr);

						// Update Condicionventa name
						condicionventa.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Condicionventa
						agent.put('/api/condicionventas/' + condicionventaSaveRes.body._id)
							.send(condicionventa)
							.expect(200)
							.end(function(condicionventaUpdateErr, condicionventaUpdateRes) {
								// Handle Condicionventa update error
								if (condicionventaUpdateErr) done(condicionventaUpdateErr);

								// Set assertions
								(condicionventaUpdateRes.body._id).should.equal(condicionventaSaveRes.body._id);
								(condicionventaUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Condicionventas if not signed in', function(done) {
		// Create new Condicionventa model instance
		var condicionventaObj = new Condicionventa(condicionventa);

		// Save the Condicionventa
		condicionventaObj.save(function() {
			// Request Condicionventas
			request(app).get('/api/condicionventas')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Condicionventa if not signed in', function(done) {
		// Create new Condicionventa model instance
		var condicionventaObj = new Condicionventa(condicionventa);

		// Save the Condicionventa
		condicionventaObj.save(function() {
			request(app).get('/api/condicionventas/' + condicionventaObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', condicionventa.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Condicionventa instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Condicionventa
				agent.post('/api/condicionventas')
					.send(condicionventa)
					.expect(200)
					.end(function(condicionventaSaveErr, condicionventaSaveRes) {
						// Handle Condicionventa save error
						if (condicionventaSaveErr) done(condicionventaSaveErr);

						// Delete existing Condicionventa
						agent.delete('/api/condicionventas/' + condicionventaSaveRes.body._id)
							.send(condicionventa)
							.expect(200)
							.end(function(condicionventaDeleteErr, condicionventaDeleteRes) {
								// Handle Condicionventa error error
								if (condicionventaDeleteErr) done(condicionventaDeleteErr);

								// Set assertions
								(condicionventaDeleteRes.body._id).should.equal(condicionventaSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Condicionventa instance if not signed in', function(done) {
		// Set Condicionventa user 
		condicionventa.user = user;

		// Create new Condicionventa model instance
		var condicionventaObj = new Condicionventa(condicionventa);

		// Save the Condicionventa
		condicionventaObj.save(function() {
			// Try deleting Condicionventa
			request(app).delete('/api/condicionventas/' + condicionventaObj._id)
			.expect(403)
			.end(function(condicionventaDeleteErr, condicionventaDeleteRes) {
				// Set message assertion
				(condicionventaDeleteRes.body.message).should.match('User is not authorized');

				// Handle Condicionventa error error
				done(condicionventaDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Condicionventa.remove().exec(function(){
				done();
			});
		});
	});
});
