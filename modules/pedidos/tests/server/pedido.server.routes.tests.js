'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Pedido = mongoose.model('Pedido'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, pedido;

/**
 * Pedido routes tests
 */
describe('Pedido CRUD tests', function() {
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

		// Save a user to the test db and create new Pedido
		user.save(function() {
			pedido = {
				name: 'Pedido Name'
			};

			done();
		});
	});

	it('should be able to save Pedido instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Pedido
				agent.post('/api/pedidos')
					.send(pedido)
					.expect(200)
					.end(function(pedidoSaveErr, pedidoSaveRes) {
						// Handle Pedido save error
						if (pedidoSaveErr) done(pedidoSaveErr);

						// Get a list of Pedidos
						agent.get('/api/pedidos')
							.end(function(pedidosGetErr, pedidosGetRes) {
								// Handle Pedido save error
								if (pedidosGetErr) done(pedidosGetErr);

								// Get Pedidos list
								var pedidos = pedidosGetRes.body;

								// Set assertions
								(pedidos[0].user._id).should.equal(userId);
								(pedidos[0].name).should.match('Pedido Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Pedido instance if not logged in', function(done) {
		agent.post('/api/pedidos')
			.send(pedido)
			.expect(403)
			.end(function(pedidoSaveErr, pedidoSaveRes) {
				// Call the assertion callback
				done(pedidoSaveErr);
			});
	});

	it('should not be able to save Pedido instance if no name is provided', function(done) {
		// Invalidate name field
		pedido.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Pedido
				agent.post('/api/pedidos')
					.send(pedido)
					.expect(400)
					.end(function(pedidoSaveErr, pedidoSaveRes) {
						// Set message assertion
						(pedidoSaveRes.body.message).should.match('Please fill Pedido name');
						
						// Handle Pedido save error
						done(pedidoSaveErr);
					});
			});
	});

	it('should be able to update Pedido instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Pedido
				agent.post('/api/pedidos')
					.send(pedido)
					.expect(200)
					.end(function(pedidoSaveErr, pedidoSaveRes) {
						// Handle Pedido save error
						if (pedidoSaveErr) done(pedidoSaveErr);

						// Update Pedido name
						pedido.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Pedido
						agent.put('/api/pedidos/' + pedidoSaveRes.body._id)
							.send(pedido)
							.expect(200)
							.end(function(pedidoUpdateErr, pedidoUpdateRes) {
								// Handle Pedido update error
								if (pedidoUpdateErr) done(pedidoUpdateErr);

								// Set assertions
								(pedidoUpdateRes.body._id).should.equal(pedidoSaveRes.body._id);
								(pedidoUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Pedidos if not signed in', function(done) {
		// Create new Pedido model instance
		var pedidoObj = new Pedido(pedido);

		// Save the Pedido
		pedidoObj.save(function() {
			// Request Pedidos
			request(app).get('/api/pedidos')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Pedido if not signed in', function(done) {
		// Create new Pedido model instance
		var pedidoObj = new Pedido(pedido);

		// Save the Pedido
		pedidoObj.save(function() {
			request(app).get('/api/pedidos/' + pedidoObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', pedido.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Pedido instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Pedido
				agent.post('/api/pedidos')
					.send(pedido)
					.expect(200)
					.end(function(pedidoSaveErr, pedidoSaveRes) {
						// Handle Pedido save error
						if (pedidoSaveErr) done(pedidoSaveErr);

						// Delete existing Pedido
						agent.delete('/api/pedidos/' + pedidoSaveRes.body._id)
							.send(pedido)
							.expect(200)
							.end(function(pedidoDeleteErr, pedidoDeleteRes) {
								// Handle Pedido error error
								if (pedidoDeleteErr) done(pedidoDeleteErr);

								// Set assertions
								(pedidoDeleteRes.body._id).should.equal(pedidoSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Pedido instance if not signed in', function(done) {
		// Set Pedido user 
		pedido.user = user;

		// Create new Pedido model instance
		var pedidoObj = new Pedido(pedido);

		// Save the Pedido
		pedidoObj.save(function() {
			// Try deleting Pedido
			request(app).delete('/api/pedidos/' + pedidoObj._id)
			.expect(403)
			.end(function(pedidoDeleteErr, pedidoDeleteRes) {
				// Set message assertion
				(pedidoDeleteRes.body.message).should.match('User is not authorized');

				// Handle Pedido error error
				done(pedidoDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Pedido.remove().exec(function(){
				done();
			});
		});
	});
});
