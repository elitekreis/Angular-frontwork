'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Entrega = mongoose.model('Entrega'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, entrega;

/**
 * Entrega routes tests
 */
describe('Entrega CRUD tests', function() {
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

		// Save a user to the test db and create new Entrega
		user.save(function() {
			entrega = {
				name: 'Entrega Name'
			};

			done();
		});
	});

	it('should be able to save Entrega instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Entrega
				agent.post('/api/entregas')
					.send(entrega)
					.expect(200)
					.end(function(entregaSaveErr, entregaSaveRes) {
						// Handle Entrega save error
						if (entregaSaveErr) done(entregaSaveErr);

						// Get a list of Entregas
						agent.get('/api/entregas')
							.end(function(entregasGetErr, entregasGetRes) {
								// Handle Entrega save error
								if (entregasGetErr) done(entregasGetErr);

								// Get Entregas list
								var entregas = entregasGetRes.body;

								// Set assertions
								(entregas[0].user._id).should.equal(userId);
								(entregas[0].name).should.match('Entrega Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Entrega instance if not logged in', function(done) {
		agent.post('/api/entregas')
			.send(entrega)
			.expect(403)
			.end(function(entregaSaveErr, entregaSaveRes) {
				// Call the assertion callback
				done(entregaSaveErr);
			});
	});

	it('should not be able to save Entrega instance if no name is provided', function(done) {
		// Invalidate name field
		entrega.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Entrega
				agent.post('/api/entregas')
					.send(entrega)
					.expect(400)
					.end(function(entregaSaveErr, entregaSaveRes) {
						// Set message assertion
						(entregaSaveRes.body.message).should.match('Please fill Entrega name');
						
						// Handle Entrega save error
						done(entregaSaveErr);
					});
			});
	});

	it('should be able to update Entrega instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Entrega
				agent.post('/api/entregas')
					.send(entrega)
					.expect(200)
					.end(function(entregaSaveErr, entregaSaveRes) {
						// Handle Entrega save error
						if (entregaSaveErr) done(entregaSaveErr);

						// Update Entrega name
						entrega.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Entrega
						agent.put('/api/entregas/' + entregaSaveRes.body._id)
							.send(entrega)
							.expect(200)
							.end(function(entregaUpdateErr, entregaUpdateRes) {
								// Handle Entrega update error
								if (entregaUpdateErr) done(entregaUpdateErr);

								// Set assertions
								(entregaUpdateRes.body._id).should.equal(entregaSaveRes.body._id);
								(entregaUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Entregas if not signed in', function(done) {
		// Create new Entrega model instance
		var entregaObj = new Entrega(entrega);

		// Save the Entrega
		entregaObj.save(function() {
			// Request Entregas
			request(app).get('/api/entregas')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Entrega if not signed in', function(done) {
		// Create new Entrega model instance
		var entregaObj = new Entrega(entrega);

		// Save the Entrega
		entregaObj.save(function() {
			request(app).get('/api/entregas/' + entregaObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', entrega.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Entrega instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Entrega
				agent.post('/api/entregas')
					.send(entrega)
					.expect(200)
					.end(function(entregaSaveErr, entregaSaveRes) {
						// Handle Entrega save error
						if (entregaSaveErr) done(entregaSaveErr);

						// Delete existing Entrega
						agent.delete('/api/entregas/' + entregaSaveRes.body._id)
							.send(entrega)
							.expect(200)
							.end(function(entregaDeleteErr, entregaDeleteRes) {
								// Handle Entrega error error
								if (entregaDeleteErr) done(entregaDeleteErr);

								// Set assertions
								(entregaDeleteRes.body._id).should.equal(entregaSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Entrega instance if not signed in', function(done) {
		// Set Entrega user 
		entrega.user = user;

		// Create new Entrega model instance
		var entregaObj = new Entrega(entrega);

		// Save the Entrega
		entregaObj.save(function() {
			// Try deleting Entrega
			request(app).delete('/api/entregas/' + entregaObj._id)
			.expect(403)
			.end(function(entregaDeleteErr, entregaDeleteRes) {
				// Set message assertion
				(entregaDeleteRes.body.message).should.match('User is not authorized');

				// Handle Entrega error error
				done(entregaDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Entrega.remove().exec(function(){
				done();
			});
		});
	});
});
