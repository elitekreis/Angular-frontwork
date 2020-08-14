'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Sub = mongoose.model('Sub'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, sub;

/**
 * Sub routes tests
 */
describe('Sub CRUD tests', function() {
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

		// Save a user to the test db and create new Sub
		user.save(function() {
			sub = {
				name: 'Sub Name'
			};

			done();
		});
	});

	it('should be able to save Sub instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sub
				agent.post('/api/subs')
					.send(sub)
					.expect(200)
					.end(function(subSaveErr, subSaveRes) {
						// Handle Sub save error
						if (subSaveErr) done(subSaveErr);

						// Get a list of Subs
						agent.get('/api/subs')
							.end(function(subsGetErr, subsGetRes) {
								// Handle Sub save error
								if (subsGetErr) done(subsGetErr);

								// Get Subs list
								var subs = subsGetRes.body;

								// Set assertions
								(subs[0].user._id).should.equal(userId);
								(subs[0].name).should.match('Sub Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Sub instance if not logged in', function(done) {
		agent.post('/api/subs')
			.send(sub)
			.expect(403)
			.end(function(subSaveErr, subSaveRes) {
				// Call the assertion callback
				done(subSaveErr);
			});
	});

	it('should not be able to save Sub instance if no name is provided', function(done) {
		// Invalidate name field
		sub.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sub
				agent.post('/api/subs')
					.send(sub)
					.expect(400)
					.end(function(subSaveErr, subSaveRes) {
						// Set message assertion
						(subSaveRes.body.message).should.match('Please fill Sub name');
						
						// Handle Sub save error
						done(subSaveErr);
					});
			});
	});

	it('should be able to update Sub instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sub
				agent.post('/api/subs')
					.send(sub)
					.expect(200)
					.end(function(subSaveErr, subSaveRes) {
						// Handle Sub save error
						if (subSaveErr) done(subSaveErr);

						// Update Sub name
						sub.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Sub
						agent.put('/api/subs/' + subSaveRes.body._id)
							.send(sub)
							.expect(200)
							.end(function(subUpdateErr, subUpdateRes) {
								// Handle Sub update error
								if (subUpdateErr) done(subUpdateErr);

								// Set assertions
								(subUpdateRes.body._id).should.equal(subSaveRes.body._id);
								(subUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Subs if not signed in', function(done) {
		// Create new Sub model instance
		var subObj = new Sub(sub);

		// Save the Sub
		subObj.save(function() {
			// Request Subs
			request(app).get('/api/subs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Sub if not signed in', function(done) {
		// Create new Sub model instance
		var subObj = new Sub(sub);

		// Save the Sub
		subObj.save(function() {
			request(app).get('/api/subs/' + subObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', sub.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Sub instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sub
				agent.post('/api/subs')
					.send(sub)
					.expect(200)
					.end(function(subSaveErr, subSaveRes) {
						// Handle Sub save error
						if (subSaveErr) done(subSaveErr);

						// Delete existing Sub
						agent.delete('/api/subs/' + subSaveRes.body._id)
							.send(sub)
							.expect(200)
							.end(function(subDeleteErr, subDeleteRes) {
								// Handle Sub error error
								if (subDeleteErr) done(subDeleteErr);

								// Set assertions
								(subDeleteRes.body._id).should.equal(subSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Sub instance if not signed in', function(done) {
		// Set Sub user 
		sub.user = user;

		// Create new Sub model instance
		var subObj = new Sub(sub);

		// Save the Sub
		subObj.save(function() {
			// Try deleting Sub
			request(app).delete('/api/subs/' + subObj._id)
			.expect(403)
			.end(function(subDeleteErr, subDeleteRes) {
				// Set message assertion
				(subDeleteRes.body.message).should.match('User is not authorized');

				// Handle Sub error error
				done(subDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Sub.remove().exec(function(){
				done();
			});
		});
	});
});
