'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Puesto = mongoose.model('Puesto'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, puesto;

/**
 * Puesto routes tests
 */
describe('Puesto CRUD tests', function() {
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

		// Save a user to the test db and create new Puesto
		user.save(function() {
			puesto = {
				name: 'Puesto Name'
			};

			done();
		});
	});

	it('should be able to save Puesto instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Puesto
				agent.post('/api/puestos')
					.send(puesto)
					.expect(200)
					.end(function(puestoSaveErr, puestoSaveRes) {
						// Handle Puesto save error
						if (puestoSaveErr) done(puestoSaveErr);

						// Get a list of Puestos
						agent.get('/api/puestos')
							.end(function(puestosGetErr, puestosGetRes) {
								// Handle Puesto save error
								if (puestosGetErr) done(puestosGetErr);

								// Get Puestos list
								var puestos = puestosGetRes.body;

								// Set assertions
								(puestos[0].user._id).should.equal(userId);
								(puestos[0].name).should.match('Puesto Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Puesto instance if not logged in', function(done) {
		agent.post('/api/puestos')
			.send(puesto)
			.expect(403)
			.end(function(puestoSaveErr, puestoSaveRes) {
				// Call the assertion callback
				done(puestoSaveErr);
			});
	});

	it('should not be able to save Puesto instance if no name is provided', function(done) {
		// Invalidate name field
		puesto.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Puesto
				agent.post('/api/puestos')
					.send(puesto)
					.expect(400)
					.end(function(puestoSaveErr, puestoSaveRes) {
						// Set message assertion
						(puestoSaveRes.body.message).should.match('Please fill Puesto name');
						
						// Handle Puesto save error
						done(puestoSaveErr);
					});
			});
	});

	it('should be able to update Puesto instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Puesto
				agent.post('/api/puestos')
					.send(puesto)
					.expect(200)
					.end(function(puestoSaveErr, puestoSaveRes) {
						// Handle Puesto save error
						if (puestoSaveErr) done(puestoSaveErr);

						// Update Puesto name
						puesto.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Puesto
						agent.put('/api/puestos/' + puestoSaveRes.body._id)
							.send(puesto)
							.expect(200)
							.end(function(puestoUpdateErr, puestoUpdateRes) {
								// Handle Puesto update error
								if (puestoUpdateErr) done(puestoUpdateErr);

								// Set assertions
								(puestoUpdateRes.body._id).should.equal(puestoSaveRes.body._id);
								(puestoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Puestos if not signed in', function(done) {
		// Create new Puesto model instance
		var puestoObj = new Puesto(puesto);

		// Save the Puesto
		puestoObj.save(function() {
			// Request Puestos
			request(app).get('/api/puestos')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Puesto if not signed in', function(done) {
		// Create new Puesto model instance
		var puestoObj = new Puesto(puesto);

		// Save the Puesto
		puestoObj.save(function() {
			request(app).get('/api/puestos/' + puestoObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', puesto.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Puesto instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Puesto
				agent.post('/api/puestos')
					.send(puesto)
					.expect(200)
					.end(function(puestoSaveErr, puestoSaveRes) {
						// Handle Puesto save error
						if (puestoSaveErr) done(puestoSaveErr);

						// Delete existing Puesto
						agent.delete('/api/puestos/' + puestoSaveRes.body._id)
							.send(puesto)
							.expect(200)
							.end(function(puestoDeleteErr, puestoDeleteRes) {
								// Handle Puesto error error
								if (puestoDeleteErr) done(puestoDeleteErr);

								// Set assertions
								(puestoDeleteRes.body._id).should.equal(puestoSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Puesto instance if not signed in', function(done) {
		// Set Puesto user 
		puesto.user = user;

		// Create new Puesto model instance
		var puestoObj = new Puesto(puesto);

		// Save the Puesto
		puestoObj.save(function() {
			// Try deleting Puesto
			request(app).delete('/api/puestos/' + puestoObj._id)
			.expect(403)
			.end(function(puestoDeleteErr, puestoDeleteRes) {
				// Set message assertion
				(puestoDeleteRes.body.message).should.match('User is not authorized');

				// Handle Puesto error error
				done(puestoDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Puesto.remove().exec(function(){
				done();
			});
		});
	});
});
