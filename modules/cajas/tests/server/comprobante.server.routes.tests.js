'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Comprobante = mongoose.model('Comprobante'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, comprobante;

/**
 * Comprobante routes tests
 */
describe('Comprobante CRUD tests', function() {
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

		// Save a user to the test db and create new Comprobante
		user.save(function() {
			comprobante = {
				name: 'Comprobante Name'
			};

			done();
		});
	});

	it('should be able to save Comprobante instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comprobante
				agent.post('/api/comprobantes')
					.send(comprobante)
					.expect(200)
					.end(function(comprobanteSaveErr, comprobanteSaveRes) {
						// Handle Comprobante save error
						if (comprobanteSaveErr) done(comprobanteSaveErr);

						// Get a list of Comprobantes
						agent.get('/api/comprobantes')
							.end(function(comprobantesGetErr, comprobantesGetRes) {
								// Handle Comprobante save error
								if (comprobantesGetErr) done(comprobantesGetErr);

								// Get Comprobantes list
								var comprobantes = comprobantesGetRes.body;

								// Set assertions
								(comprobantes[0].user._id).should.equal(userId);
								(comprobantes[0].name).should.match('Comprobante Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Comprobante instance if not logged in', function(done) {
		agent.post('/api/comprobantes')
			.send(comprobante)
			.expect(403)
			.end(function(comprobanteSaveErr, comprobanteSaveRes) {
				// Call the assertion callback
				done(comprobanteSaveErr);
			});
	});

	it('should not be able to save Comprobante instance if no name is provided', function(done) {
		// Invalidate name field
		comprobante.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comprobante
				agent.post('/api/comprobantes')
					.send(comprobante)
					.expect(400)
					.end(function(comprobanteSaveErr, comprobanteSaveRes) {
						// Set message assertion
						(comprobanteSaveRes.body.message).should.match('Please fill Comprobante name');
						
						// Handle Comprobante save error
						done(comprobanteSaveErr);
					});
			});
	});

	it('should be able to update Comprobante instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comprobante
				agent.post('/api/comprobantes')
					.send(comprobante)
					.expect(200)
					.end(function(comprobanteSaveErr, comprobanteSaveRes) {
						// Handle Comprobante save error
						if (comprobanteSaveErr) done(comprobanteSaveErr);

						// Update Comprobante name
						comprobante.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Comprobante
						agent.put('/api/comprobantes/' + comprobanteSaveRes.body._id)
							.send(comprobante)
							.expect(200)
							.end(function(comprobanteUpdateErr, comprobanteUpdateRes) {
								// Handle Comprobante update error
								if (comprobanteUpdateErr) done(comprobanteUpdateErr);

								// Set assertions
								(comprobanteUpdateRes.body._id).should.equal(comprobanteSaveRes.body._id);
								(comprobanteUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Comprobantes if not signed in', function(done) {
		// Create new Comprobante model instance
		var comprobanteObj = new Comprobante(comprobante);

		// Save the Comprobante
		comprobanteObj.save(function() {
			// Request Comprobantes
			request(app).get('/api/comprobantes')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Comprobante if not signed in', function(done) {
		// Create new Comprobante model instance
		var comprobanteObj = new Comprobante(comprobante);

		// Save the Comprobante
		comprobanteObj.save(function() {
			request(app).get('/api/comprobantes/' + comprobanteObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', comprobante.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Comprobante instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Comprobante
				agent.post('/api/comprobantes')
					.send(comprobante)
					.expect(200)
					.end(function(comprobanteSaveErr, comprobanteSaveRes) {
						// Handle Comprobante save error
						if (comprobanteSaveErr) done(comprobanteSaveErr);

						// Delete existing Comprobante
						agent.delete('/api/comprobantes/' + comprobanteSaveRes.body._id)
							.send(comprobante)
							.expect(200)
							.end(function(comprobanteDeleteErr, comprobanteDeleteRes) {
								// Handle Comprobante error error
								if (comprobanteDeleteErr) done(comprobanteDeleteErr);

								// Set assertions
								(comprobanteDeleteRes.body._id).should.equal(comprobanteSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Comprobante instance if not signed in', function(done) {
		// Set Comprobante user 
		comprobante.user = user;

		// Create new Comprobante model instance
		var comprobanteObj = new Comprobante(comprobante);

		// Save the Comprobante
		comprobanteObj.save(function() {
			// Try deleting Comprobante
			request(app).delete('/api/comprobantes/' + comprobanteObj._id)
			.expect(403)
			.end(function(comprobanteDeleteErr, comprobanteDeleteRes) {
				// Set message assertion
				(comprobanteDeleteRes.body.message).should.match('User is not authorized');

				// Handle Comprobante error error
				done(comprobanteDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Comprobante.remove().exec(function(){
				done();
			});
		});
	});
});
