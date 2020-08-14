'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Costcenter = mongoose.model('Costcenter'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, costcenter;

/**
 * Costcenter routes tests
 */
describe('Costcenter CRUD tests', function() {
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

		// Save a user to the test db and create new Costcenter
		user.save(function() {
			costcenter = {
				name: 'Costcenter Name'
			};

			done();
		});
	});

	it('should be able to save Costcenter instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Costcenter
				agent.post('/api/costcenters')
					.send(costcenter)
					.expect(200)
					.end(function(costcenterSaveErr, costcenterSaveRes) {
						// Handle Costcenter save error
						if (costcenterSaveErr) done(costcenterSaveErr);

						// Get a list of Costcenters
						agent.get('/api/costcenters')
							.end(function(costcentersGetErr, costcentersGetRes) {
								// Handle Costcenter save error
								if (costcentersGetErr) done(costcentersGetErr);

								// Get Costcenters list
								var costcenters = costcentersGetRes.body;

								// Set assertions
								(costcenters[0].user._id).should.equal(userId);
								(costcenters[0].name).should.match('Costcenter Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Costcenter instance if not logged in', function(done) {
		agent.post('/api/costcenters')
			.send(costcenter)
			.expect(403)
			.end(function(costcenterSaveErr, costcenterSaveRes) {
				// Call the assertion callback
				done(costcenterSaveErr);
			});
	});

	it('should not be able to save Costcenter instance if no name is provided', function(done) {
		// Invalidate name field
		costcenter.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Costcenter
				agent.post('/api/costcenters')
					.send(costcenter)
					.expect(400)
					.end(function(costcenterSaveErr, costcenterSaveRes) {
						// Set message assertion
						(costcenterSaveRes.body.message).should.match('Please fill Costcenter name');
						
						// Handle Costcenter save error
						done(costcenterSaveErr);
					});
			});
	});

	it('should be able to update Costcenter instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Costcenter
				agent.post('/api/costcenters')
					.send(costcenter)
					.expect(200)
					.end(function(costcenterSaveErr, costcenterSaveRes) {
						// Handle Costcenter save error
						if (costcenterSaveErr) done(costcenterSaveErr);

						// Update Costcenter name
						costcenter.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Costcenter
						agent.put('/api/costcenters/' + costcenterSaveRes.body._id)
							.send(costcenter)
							.expect(200)
							.end(function(costcenterUpdateErr, costcenterUpdateRes) {
								// Handle Costcenter update error
								if (costcenterUpdateErr) done(costcenterUpdateErr);

								// Set assertions
								(costcenterUpdateRes.body._id).should.equal(costcenterSaveRes.body._id);
								(costcenterUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Costcenters if not signed in', function(done) {
		// Create new Costcenter model instance
		var costcenterObj = new Costcenter(costcenter);

		// Save the Costcenter
		costcenterObj.save(function() {
			// Request Costcenters
			request(app).get('/api/costcenters')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Costcenter if not signed in', function(done) {
		// Create new Costcenter model instance
		var costcenterObj = new Costcenter(costcenter);

		// Save the Costcenter
		costcenterObj.save(function() {
			request(app).get('/api/costcenters/' + costcenterObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', costcenter.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Costcenter instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Costcenter
				agent.post('/api/costcenters')
					.send(costcenter)
					.expect(200)
					.end(function(costcenterSaveErr, costcenterSaveRes) {
						// Handle Costcenter save error
						if (costcenterSaveErr) done(costcenterSaveErr);

						// Delete existing Costcenter
						agent.delete('/api/costcenters/' + costcenterSaveRes.body._id)
							.send(costcenter)
							.expect(200)
							.end(function(costcenterDeleteErr, costcenterDeleteRes) {
								// Handle Costcenter error error
								if (costcenterDeleteErr) done(costcenterDeleteErr);

								// Set assertions
								(costcenterDeleteRes.body._id).should.equal(costcenterSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Costcenter instance if not signed in', function(done) {
		// Set Costcenter user 
		costcenter.user = user;

		// Create new Costcenter model instance
		var costcenterObj = new Costcenter(costcenter);

		// Save the Costcenter
		costcenterObj.save(function() {
			// Try deleting Costcenter
			request(app).delete('/api/costcenters/' + costcenterObj._id)
			.expect(403)
			.end(function(costcenterDeleteErr, costcenterDeleteRes) {
				// Set message assertion
				(costcenterDeleteRes.body.message).should.match('User is not authorized');

				// Handle Costcenter error error
				done(costcenterDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Costcenter.remove().exec(function(){
				done();
			});
		});
	});
});
