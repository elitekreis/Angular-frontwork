'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Proceso = mongoose.model('Proceso'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, proceso;

/**
 * Proceso routes tests
 */
describe('Proceso CRUD tests', function() {
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

		// Save a user to the test db and create new Proceso
		user.save(function() {
			proceso = {
				name: 'Proceso Name'
			};

			done();
		});
	});

	it('should be able to save Proceso instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Proceso
				agent.post('/api/procesos')
					.send(proceso)
					.expect(200)
					.end(function(procesoSaveErr, procesoSaveRes) {
						// Handle Proceso save error
						if (procesoSaveErr) done(procesoSaveErr);

						// Get a list of Procesos
						agent.get('/api/procesos')
							.end(function(procesosGetErr, procesosGetRes) {
								// Handle Proceso save error
								if (procesosGetErr) done(procesosGetErr);

								// Get Procesos list
								var procesos = procesosGetRes.body;

								// Set assertions
								(procesos[0].user._id).should.equal(userId);
								(procesos[0].name).should.match('Proceso Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Proceso instance if not logged in', function(done) {
		agent.post('/api/procesos')
			.send(proceso)
			.expect(403)
			.end(function(procesoSaveErr, procesoSaveRes) {
				// Call the assertion callback
				done(procesoSaveErr);
			});
	});

	it('should not be able to save Proceso instance if no name is provided', function(done) {
		// Invalidate name field
		proceso.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Proceso
				agent.post('/api/procesos')
					.send(proceso)
					.expect(400)
					.end(function(procesoSaveErr, procesoSaveRes) {
						// Set message assertion
						(procesoSaveRes.body.message).should.match('Please fill Proceso name');
						
						// Handle Proceso save error
						done(procesoSaveErr);
					});
			});
	});

	it('should be able to update Proceso instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Proceso
				agent.post('/api/procesos')
					.send(proceso)
					.expect(200)
					.end(function(procesoSaveErr, procesoSaveRes) {
						// Handle Proceso save error
						if (procesoSaveErr) done(procesoSaveErr);

						// Update Proceso name
						proceso.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Proceso
						agent.put('/api/procesos/' + procesoSaveRes.body._id)
							.send(proceso)
							.expect(200)
							.end(function(procesoUpdateErr, procesoUpdateRes) {
								// Handle Proceso update error
								if (procesoUpdateErr) done(procesoUpdateErr);

								// Set assertions
								(procesoUpdateRes.body._id).should.equal(procesoSaveRes.body._id);
								(procesoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Procesos if not signed in', function(done) {
		// Create new Proceso model instance
		var procesoObj = new Proceso(proceso);

		// Save the Proceso
		procesoObj.save(function() {
			// Request Procesos
			request(app).get('/api/procesos')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Proceso if not signed in', function(done) {
		// Create new Proceso model instance
		var procesoObj = new Proceso(proceso);

		// Save the Proceso
		procesoObj.save(function() {
			request(app).get('/api/procesos/' + procesoObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', proceso.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Proceso instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Proceso
				agent.post('/api/procesos')
					.send(proceso)
					.expect(200)
					.end(function(procesoSaveErr, procesoSaveRes) {
						// Handle Proceso save error
						if (procesoSaveErr) done(procesoSaveErr);

						// Delete existing Proceso
						agent.delete('/api/procesos/' + procesoSaveRes.body._id)
							.send(proceso)
							.expect(200)
							.end(function(procesoDeleteErr, procesoDeleteRes) {
								// Handle Proceso error error
								if (procesoDeleteErr) done(procesoDeleteErr);

								// Set assertions
								(procesoDeleteRes.body._id).should.equal(procesoSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Proceso instance if not signed in', function(done) {
		// Set Proceso user 
		proceso.user = user;

		// Create new Proceso model instance
		var procesoObj = new Proceso(proceso);

		// Save the Proceso
		procesoObj.save(function() {
			// Try deleting Proceso
			request(app).delete('/api/procesos/' + procesoObj._id)
			.expect(403)
			.end(function(procesoDeleteErr, procesoDeleteRes) {
				// Set message assertion
				(procesoDeleteRes.body.message).should.match('User is not authorized');

				// Handle Proceso error error
				done(procesoDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Proceso.remove().exec(function(){
				done();
			});
		});
	});
});
