'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Enterprise = mongoose.model('Enterprise'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, enterprise;

/**
 * Enterprise routes tests
 */
describe('Enterprise CRUD tests', function() {
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

		// Save a user to the test db and create new Enterprise
		user.save(function() {
			enterprise = {
				name: 'Enterprise Name'
			};

			done();
		});
	});

	it('should be able to save Enterprise instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Enterprise
				agent.post('/api/enterprises')
					.send(enterprise)
					.expect(200)
					.end(function(enterpriseSaveErr, enterpriseSaveRes) {
						// Handle Enterprise save error
						if (enterpriseSaveErr) done(enterpriseSaveErr);

						// Get a list of Enterprises
						agent.get('/api/enterprises')
							.end(function(enterprisesGetErr, enterprisesGetRes) {
								// Handle Enterprise save error
								if (enterprisesGetErr) done(enterprisesGetErr);

								// Get Enterprises list
								var enterprises = enterprisesGetRes.body;

								// Set assertions
								(enterprises[0].user._id).should.equal(userId);
								(enterprises[0].name).should.match('Enterprise Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Enterprise instance if not logged in', function(done) {
		agent.post('/api/enterprises')
			.send(enterprise)
			.expect(403)
			.end(function(enterpriseSaveErr, enterpriseSaveRes) {
				// Call the assertion callback
				done(enterpriseSaveErr);
			});
	});

	it('should not be able to save Enterprise instance if no name is provided', function(done) {
		// Invalidate name field
		enterprise.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Enterprise
				agent.post('/api/enterprises')
					.send(enterprise)
					.expect(400)
					.end(function(enterpriseSaveErr, enterpriseSaveRes) {
						// Set message assertion
						(enterpriseSaveRes.body.message).should.match('Please fill Enterprise name');
						
						// Handle Enterprise save error
						done(enterpriseSaveErr);
					});
			});
	});

	it('should be able to update Enterprise instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Enterprise
				agent.post('/api/enterprises')
					.send(enterprise)
					.expect(200)
					.end(function(enterpriseSaveErr, enterpriseSaveRes) {
						// Handle Enterprise save error
						if (enterpriseSaveErr) done(enterpriseSaveErr);

						// Update Enterprise name
						enterprise.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Enterprise
						agent.put('/api/enterprises/' + enterpriseSaveRes.body._id)
							.send(enterprise)
							.expect(200)
							.end(function(enterpriseUpdateErr, enterpriseUpdateRes) {
								// Handle Enterprise update error
								if (enterpriseUpdateErr) done(enterpriseUpdateErr);

								// Set assertions
								(enterpriseUpdateRes.body._id).should.equal(enterpriseSaveRes.body._id);
								(enterpriseUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Enterprises if not signed in', function(done) {
		// Create new Enterprise model instance
		var enterpriseObj = new Enterprise(enterprise);

		// Save the Enterprise
		enterpriseObj.save(function() {
			// Request Enterprises
			request(app).get('/api/enterprises')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Enterprise if not signed in', function(done) {
		// Create new Enterprise model instance
		var enterpriseObj = new Enterprise(enterprise);

		// Save the Enterprise
		enterpriseObj.save(function() {
			request(app).get('/api/enterprises/' + enterpriseObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', enterprise.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Enterprise instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Enterprise
				agent.post('/api/enterprises')
					.send(enterprise)
					.expect(200)
					.end(function(enterpriseSaveErr, enterpriseSaveRes) {
						// Handle Enterprise save error
						if (enterpriseSaveErr) done(enterpriseSaveErr);

						// Delete existing Enterprise
						agent.delete('/api/enterprises/' + enterpriseSaveRes.body._id)
							.send(enterprise)
							.expect(200)
							.end(function(enterpriseDeleteErr, enterpriseDeleteRes) {
								// Handle Enterprise error error
								if (enterpriseDeleteErr) done(enterpriseDeleteErr);

								// Set assertions
								(enterpriseDeleteRes.body._id).should.equal(enterpriseSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Enterprise instance if not signed in', function(done) {
		// Set Enterprise user 
		enterprise.user = user;

		// Create new Enterprise model instance
		var enterpriseObj = new Enterprise(enterprise);

		// Save the Enterprise
		enterpriseObj.save(function() {
			// Try deleting Enterprise
			request(app).delete('/api/enterprises/' + enterpriseObj._id)
			.expect(403)
			.end(function(enterpriseDeleteErr, enterpriseDeleteRes) {
				// Set message assertion
				(enterpriseDeleteRes.body.message).should.match('User is not authorized');

				// Handle Enterprise error error
				done(enterpriseDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Enterprise.remove().exec(function(){
				done();
			});
		});
	});
});
