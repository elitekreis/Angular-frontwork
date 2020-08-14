'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Venta = mongoose.model('Venta'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, venta;

/**
 * Venta routes tests
 */
describe('Venta CRUD tests', function() {
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

		// Save a user to the test db and create new Venta
		user.save(function() {
			venta = {
				name: 'Venta Name'
			};

			done();
		});
	});

	it('should be able to save Venta instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Venta
				agent.post('/api/ventas')
					.send(venta)
					.expect(200)
					.end(function(ventaSaveErr, ventaSaveRes) {
						// Handle Venta save error
						if (ventaSaveErr) done(ventaSaveErr);

						// Get a list of Ventas
						agent.get('/api/ventas')
							.end(function(ventasGetErr, ventasGetRes) {
								// Handle Venta save error
								if (ventasGetErr) done(ventasGetErr);

								// Get Ventas list
								var ventas = ventasGetRes.body;

								// Set assertions
								(ventas[0].user._id).should.equal(userId);
								(ventas[0].name).should.match('Venta Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Venta instance if not logged in', function(done) {
		agent.post('/api/ventas')
			.send(venta)
			.expect(403)
			.end(function(ventaSaveErr, ventaSaveRes) {
				// Call the assertion callback
				done(ventaSaveErr);
			});
	});

	it('should not be able to save Venta instance if no name is provided', function(done) {
		// Invalidate name field
		venta.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Venta
				agent.post('/api/ventas')
					.send(venta)
					.expect(400)
					.end(function(ventaSaveErr, ventaSaveRes) {
						// Set message assertion
						(ventaSaveRes.body.message).should.match('Please fill Venta name');
						
						// Handle Venta save error
						done(ventaSaveErr);
					});
			});
	});

	it('should be able to update Venta instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Venta
				agent.post('/api/ventas')
					.send(venta)
					.expect(200)
					.end(function(ventaSaveErr, ventaSaveRes) {
						// Handle Venta save error
						if (ventaSaveErr) done(ventaSaveErr);

						// Update Venta name
						venta.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Venta
						agent.put('/api/ventas/' + ventaSaveRes.body._id)
							.send(venta)
							.expect(200)
							.end(function(ventaUpdateErr, ventaUpdateRes) {
								// Handle Venta update error
								if (ventaUpdateErr) done(ventaUpdateErr);

								// Set assertions
								(ventaUpdateRes.body._id).should.equal(ventaSaveRes.body._id);
								(ventaUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Ventas if not signed in', function(done) {
		// Create new Venta model instance
		var ventaObj = new Venta(venta);

		// Save the Venta
		ventaObj.save(function() {
			// Request Ventas
			request(app).get('/api/ventas')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Venta if not signed in', function(done) {
		// Create new Venta model instance
		var ventaObj = new Venta(venta);

		// Save the Venta
		ventaObj.save(function() {
			request(app).get('/api/ventas/' + ventaObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', venta.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Venta instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Venta
				agent.post('/api/ventas')
					.send(venta)
					.expect(200)
					.end(function(ventaSaveErr, ventaSaveRes) {
						// Handle Venta save error
						if (ventaSaveErr) done(ventaSaveErr);

						// Delete existing Venta
						agent.delete('/api/ventas/' + ventaSaveRes.body._id)
							.send(venta)
							.expect(200)
							.end(function(ventaDeleteErr, ventaDeleteRes) {
								// Handle Venta error error
								if (ventaDeleteErr) done(ventaDeleteErr);

								// Set assertions
								(ventaDeleteRes.body._id).should.equal(ventaSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Venta instance if not signed in', function(done) {
		// Set Venta user 
		venta.user = user;

		// Create new Venta model instance
		var ventaObj = new Venta(venta);

		// Save the Venta
		ventaObj.save(function() {
			// Try deleting Venta
			request(app).delete('/api/ventas/' + ventaObj._id)
			.expect(403)
			.end(function(ventaDeleteErr, ventaDeleteRes) {
				// Set message assertion
				(ventaDeleteRes.body.message).should.match('User is not authorized');

				// Handle Venta error error
				done(ventaDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Venta.remove().exec(function(){
				done();
			});
		});
	});
});
