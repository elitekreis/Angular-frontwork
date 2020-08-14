'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Provider = mongoose.model('Provider'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, provider;

/**
 * Provider routes tests
 */
describe('Provider CRUD tests', function() {
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

		// Save a user to the test db and create new Provider
		user.save(function() {
			provider = {
				name: 'Provider Name'
			};

			done();
		});
	});

	it('should be able to save Provider instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Provider
				agent.post('/api/providers')
					.send(provider)
					.expect(200)
					.end(function(providerSaveErr, providerSaveRes) {
						// Handle Provider save error
						if (providerSaveErr) done(providerSaveErr);

						// Get a list of Providers
						agent.get('/api/providers')
							.end(function(providersGetErr, providersGetRes) {
								// Handle Provider save error
								if (providersGetErr) done(providersGetErr);

								// Get Providers list
								var providers = providersGetRes.body;

								// Set assertions
								(providers[0].user._id).should.equal(userId);
								(providers[0].name).should.match('Provider Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Provider instance if not logged in', function(done) {
		agent.post('/api/providers')
			.send(provider)
			.expect(403)
			.end(function(providerSaveErr, providerSaveRes) {
				// Call the assertion callback
				done(providerSaveErr);
			});
	});

	it('should not be able to save Provider instance if no name is provided', function(done) {
		// Invalidate name field
		provider.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Provider
				agent.post('/api/providers')
					.send(provider)
					.expect(400)
					.end(function(providerSaveErr, providerSaveRes) {
						// Set message assertion
						(providerSaveRes.body.message).should.match('Please fill Provider name');
						
						// Handle Provider save error
						done(providerSaveErr);
					});
			});
	});

	it('should be able to update Provider instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Provider
				agent.post('/api/providers')
					.send(provider)
					.expect(200)
					.end(function(providerSaveErr, providerSaveRes) {
						// Handle Provider save error
						if (providerSaveErr) done(providerSaveErr);

						// Update Provider name
						provider.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Provider
						agent.put('/api/providers/' + providerSaveRes.body._id)
							.send(provider)
							.expect(200)
							.end(function(providerUpdateErr, providerUpdateRes) {
								// Handle Provider update error
								if (providerUpdateErr) done(providerUpdateErr);

								// Set assertions
								(providerUpdateRes.body._id).should.equal(providerSaveRes.body._id);
								(providerUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Providers if not signed in', function(done) {
		// Create new Provider model instance
		var providerObj = new Provider(provider);

		// Save the Provider
		providerObj.save(function() {
			// Request Providers
			request(app).get('/api/providers')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Provider if not signed in', function(done) {
		// Create new Provider model instance
		var providerObj = new Provider(provider);

		// Save the Provider
		providerObj.save(function() {
			request(app).get('/api/providers/' + providerObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', provider.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Provider instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Provider
				agent.post('/api/providers')
					.send(provider)
					.expect(200)
					.end(function(providerSaveErr, providerSaveRes) {
						// Handle Provider save error
						if (providerSaveErr) done(providerSaveErr);

						// Delete existing Provider
						agent.delete('/api/providers/' + providerSaveRes.body._id)
							.send(provider)
							.expect(200)
							.end(function(providerDeleteErr, providerDeleteRes) {
								// Handle Provider error error
								if (providerDeleteErr) done(providerDeleteErr);

								// Set assertions
								(providerDeleteRes.body._id).should.equal(providerSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Provider instance if not signed in', function(done) {
		// Set Provider user 
		provider.user = user;

		// Create new Provider model instance
		var providerObj = new Provider(provider);

		// Save the Provider
		providerObj.save(function() {
			// Try deleting Provider
			request(app).delete('/api/providers/' + providerObj._id)
			.expect(403)
			.end(function(providerDeleteErr, providerDeleteRes) {
				// Set message assertion
				(providerDeleteRes.body.message).should.match('User is not authorized');

				// Handle Provider error error
				done(providerDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Provider.remove().exec(function(){
				done();
			});
		});
	});
});
