'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Taxcondition = mongoose.model('Taxcondition'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, taxcondition;

/**
 * Taxcondition routes tests
 */
describe('Taxcondition CRUD tests', function() {
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

		// Save a user to the test db and create new Taxcondition
		user.save(function() {
			taxcondition = {
				name: 'Taxcondition Name'
			};

			done();
		});
	});

	it('should be able to save Taxcondition instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Taxcondition
				agent.post('/api/taxconditions')
					.send(taxcondition)
					.expect(200)
					.end(function(taxconditionSaveErr, taxconditionSaveRes) {
						// Handle Taxcondition save error
						if (taxconditionSaveErr) done(taxconditionSaveErr);

						// Get a list of Taxconditions
						agent.get('/api/taxconditions')
							.end(function(taxconditionsGetErr, taxconditionsGetRes) {
								// Handle Taxcondition save error
								if (taxconditionsGetErr) done(taxconditionsGetErr);

								// Get Taxconditions list
								var taxconditions = taxconditionsGetRes.body;

								// Set assertions
								(taxconditions[0].user._id).should.equal(userId);
								(taxconditions[0].name).should.match('Taxcondition Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Taxcondition instance if not logged in', function(done) {
		agent.post('/api/taxconditions')
			.send(taxcondition)
			.expect(403)
			.end(function(taxconditionSaveErr, taxconditionSaveRes) {
				// Call the assertion callback
				done(taxconditionSaveErr);
			});
	});

	it('should not be able to save Taxcondition instance if no name is provided', function(done) {
		// Invalidate name field
		taxcondition.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Taxcondition
				agent.post('/api/taxconditions')
					.send(taxcondition)
					.expect(400)
					.end(function(taxconditionSaveErr, taxconditionSaveRes) {
						// Set message assertion
						(taxconditionSaveRes.body.message).should.match('Please fill Taxcondition name');
						
						// Handle Taxcondition save error
						done(taxconditionSaveErr);
					});
			});
	});

	it('should be able to update Taxcondition instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Taxcondition
				agent.post('/api/taxconditions')
					.send(taxcondition)
					.expect(200)
					.end(function(taxconditionSaveErr, taxconditionSaveRes) {
						// Handle Taxcondition save error
						if (taxconditionSaveErr) done(taxconditionSaveErr);

						// Update Taxcondition name
						taxcondition.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Taxcondition
						agent.put('/api/taxconditions/' + taxconditionSaveRes.body._id)
							.send(taxcondition)
							.expect(200)
							.end(function(taxconditionUpdateErr, taxconditionUpdateRes) {
								// Handle Taxcondition update error
								if (taxconditionUpdateErr) done(taxconditionUpdateErr);

								// Set assertions
								(taxconditionUpdateRes.body._id).should.equal(taxconditionSaveRes.body._id);
								(taxconditionUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Taxconditions if not signed in', function(done) {
		// Create new Taxcondition model instance
		var taxconditionObj = new Taxcondition(taxcondition);

		// Save the Taxcondition
		taxconditionObj.save(function() {
			// Request Taxconditions
			request(app).get('/api/taxconditions')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Taxcondition if not signed in', function(done) {
		// Create new Taxcondition model instance
		var taxconditionObj = new Taxcondition(taxcondition);

		// Save the Taxcondition
		taxconditionObj.save(function() {
			request(app).get('/api/taxconditions/' + taxconditionObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', taxcondition.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Taxcondition instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Taxcondition
				agent.post('/api/taxconditions')
					.send(taxcondition)
					.expect(200)
					.end(function(taxconditionSaveErr, taxconditionSaveRes) {
						// Handle Taxcondition save error
						if (taxconditionSaveErr) done(taxconditionSaveErr);

						// Delete existing Taxcondition
						agent.delete('/api/taxconditions/' + taxconditionSaveRes.body._id)
							.send(taxcondition)
							.expect(200)
							.end(function(taxconditionDeleteErr, taxconditionDeleteRes) {
								// Handle Taxcondition error error
								if (taxconditionDeleteErr) done(taxconditionDeleteErr);

								// Set assertions
								(taxconditionDeleteRes.body._id).should.equal(taxconditionSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Taxcondition instance if not signed in', function(done) {
		// Set Taxcondition user 
		taxcondition.user = user;

		// Create new Taxcondition model instance
		var taxconditionObj = new Taxcondition(taxcondition);

		// Save the Taxcondition
		taxconditionObj.save(function() {
			// Try deleting Taxcondition
			request(app).delete('/api/taxconditions/' + taxconditionObj._id)
			.expect(403)
			.end(function(taxconditionDeleteErr, taxconditionDeleteRes) {
				// Set message assertion
				(taxconditionDeleteRes.body.message).should.match('User is not authorized');

				// Handle Taxcondition error error
				done(taxconditionDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Taxcondition.remove().exec(function(){
				done();
			});
		});
	});
});
