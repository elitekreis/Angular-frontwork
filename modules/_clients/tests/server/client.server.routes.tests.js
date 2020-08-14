'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Client = mongoose.model('Client'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, client;

/**
 * Client routes tests
 */
describe('Client CRUD tests', function() {
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

		// Save a user to the test db and create new Client
		user.save(function() {
			client = {
				name: 'Client Name'
			};

			done();
		});
	});

	it('should be able to save Client instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Client
				agent.post('/api/clients')
					.send(client)
					.expect(200)
					.end(function(clientSaveErr, clientSaveRes) {
						// Handle Client save error
						if (clientSaveErr) done(clientSaveErr);

						// Get a list of Clients
						agent.get('/api/clients')
							.end(function(clientsGetErr, clientsGetRes) {
								// Handle Client save error
								if (clientsGetErr) done(clientsGetErr);

								// Get Clients list
								var clients = clientsGetRes.body;

								// Set assertions
								(clients[0].user._id).should.equal(userId);
								(clients[0].name).should.match('Client Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Client instance if not logged in', function(done) {
		agent.post('/api/clients')
			.send(client)
			.expect(403)
			.end(function(clientSaveErr, clientSaveRes) {
				// Call the assertion callback
				done(clientSaveErr);
			});
	});

	it('should not be able to save Client instance if no name is provided', function(done) {
		// Invalidate name field
		client.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Client
				agent.post('/api/clients')
					.send(client)
					.expect(400)
					.end(function(clientSaveErr, clientSaveRes) {
						// Set message assertion
						(clientSaveRes.body.message).should.match('Please fill Client name');
						
						// Handle Client save error
						done(clientSaveErr);
					});
			});
	});

	it('should be able to update Client instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Client
				agent.post('/api/clients')
					.send(client)
					.expect(200)
					.end(function(clientSaveErr, clientSaveRes) {
						// Handle Client save error
						if (clientSaveErr) done(clientSaveErr);

						// Update Client name
						client.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Client
						agent.put('/api/clients/' + clientSaveRes.body._id)
							.send(client)
							.expect(200)
							.end(function(clientUpdateErr, clientUpdateRes) {
								// Handle Client update error
								if (clientUpdateErr) done(clientUpdateErr);

								// Set assertions
								(clientUpdateRes.body._id).should.equal(clientSaveRes.body._id);
								(clientUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Clients if not signed in', function(done) {
		// Create new Client model instance
		var clientObj = new Client(client);

		// Save the Client
		clientObj.save(function() {
			// Request Clients
			request(app).get('/api/clients')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Client if not signed in', function(done) {
		// Create new Client model instance
		var clientObj = new Client(client);

		// Save the Client
		clientObj.save(function() {
			request(app).get('/api/clients/' + clientObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', client.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Client instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Client
				agent.post('/api/clients')
					.send(client)
					.expect(200)
					.end(function(clientSaveErr, clientSaveRes) {
						// Handle Client save error
						if (clientSaveErr) done(clientSaveErr);

						// Delete existing Client
						agent.delete('/api/clients/' + clientSaveRes.body._id)
							.send(client)
							.expect(200)
							.end(function(clientDeleteErr, clientDeleteRes) {
								// Handle Client error error
								if (clientDeleteErr) done(clientDeleteErr);

								// Set assertions
								(clientDeleteRes.body._id).should.equal(clientSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Client instance if not signed in', function(done) {
		// Set Client user 
		client.user = user;

		// Create new Client model instance
		var clientObj = new Client(client);

		// Save the Client
		clientObj.save(function() {
			// Try deleting Client
			request(app).delete('/api/clients/' + clientObj._id)
			.expect(403)
			.end(function(clientDeleteErr, clientDeleteRes) {
				// Set message assertion
				(clientDeleteRes.body.message).should.match('User is not authorized');

				// Handle Client error error
				done(clientDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Client.remove().exec(function(){
				done();
			});
		});
	});
});
