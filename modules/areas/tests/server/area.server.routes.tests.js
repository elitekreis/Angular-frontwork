'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Area = mongoose.model('Area'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, area;

/**
 * Area routes tests
 */
describe('Area CRUD tests', function() {
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

		// Save a user to the test db and create new Area
		user.save(function() {
			area = {
				name: 'Area Name'
			};

			done();
		});
	});

	it('should be able to save Area instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Area
				agent.post('/api/areas')
					.send(area)
					.expect(200)
					.end(function(areaSaveErr, areaSaveRes) {
						// Handle Area save error
						if (areaSaveErr) done(areaSaveErr);

						// Get a list of Areas
						agent.get('/api/areas')
							.end(function(areasGetErr, areasGetRes) {
								// Handle Area save error
								if (areasGetErr) done(areasGetErr);

								// Get Areas list
								var areas = areasGetRes.body;

								// Set assertions
								(areas[0].user._id).should.equal(userId);
								(areas[0].name).should.match('Area Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Area instance if not logged in', function(done) {
		agent.post('/api/areas')
			.send(area)
			.expect(403)
			.end(function(areaSaveErr, areaSaveRes) {
				// Call the assertion callback
				done(areaSaveErr);
			});
	});

	it('should not be able to save Area instance if no name is provided', function(done) {
		// Invalidate name field
		area.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Area
				agent.post('/api/areas')
					.send(area)
					.expect(400)
					.end(function(areaSaveErr, areaSaveRes) {
						// Set message assertion
						(areaSaveRes.body.message).should.match('Please fill Area name');
						
						// Handle Area save error
						done(areaSaveErr);
					});
			});
	});

	it('should be able to update Area instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Area
				agent.post('/api/areas')
					.send(area)
					.expect(200)
					.end(function(areaSaveErr, areaSaveRes) {
						// Handle Area save error
						if (areaSaveErr) done(areaSaveErr);

						// Update Area name
						area.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Area
						agent.put('/api/areas/' + areaSaveRes.body._id)
							.send(area)
							.expect(200)
							.end(function(areaUpdateErr, areaUpdateRes) {
								// Handle Area update error
								if (areaUpdateErr) done(areaUpdateErr);

								// Set assertions
								(areaUpdateRes.body._id).should.equal(areaSaveRes.body._id);
								(areaUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Areas if not signed in', function(done) {
		// Create new Area model instance
		var areaObj = new Area(area);

		// Save the Area
		areaObj.save(function() {
			// Request Areas
			request(app).get('/api/areas')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Area if not signed in', function(done) {
		// Create new Area model instance
		var areaObj = new Area(area);

		// Save the Area
		areaObj.save(function() {
			request(app).get('/api/areas/' + areaObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', area.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Area instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Area
				agent.post('/api/areas')
					.send(area)
					.expect(200)
					.end(function(areaSaveErr, areaSaveRes) {
						// Handle Area save error
						if (areaSaveErr) done(areaSaveErr);

						// Delete existing Area
						agent.delete('/api/areas/' + areaSaveRes.body._id)
							.send(area)
							.expect(200)
							.end(function(areaDeleteErr, areaDeleteRes) {
								// Handle Area error error
								if (areaDeleteErr) done(areaDeleteErr);

								// Set assertions
								(areaDeleteRes.body._id).should.equal(areaSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Area instance if not signed in', function(done) {
		// Set Area user 
		area.user = user;

		// Create new Area model instance
		var areaObj = new Area(area);

		// Save the Area
		areaObj.save(function() {
			// Try deleting Area
			request(app).delete('/api/areas/' + areaObj._id)
			.expect(403)
			.end(function(areaDeleteErr, areaDeleteRes) {
				// Set message assertion
				(areaDeleteRes.body.message).should.match('User is not authorized');

				// Handle Area error error
				done(areaDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Area.remove().exec(function(){
				done();
			});
		});
	});
});
