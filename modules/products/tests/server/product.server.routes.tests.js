'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Product = mongoose.model('Product'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, product;

/**
 * Product routes tests
 */
describe('Product CRUD tests', function() {
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

		// Save a user to the test db and create new Product
		user.save(function() {
			product = {
				name: 'Product Name'
			};

			done();
		});
	});

	it('should be able to save Product instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Product
				agent.post('/api/products')
					.send(product)
					.expect(200)
					.end(function(productSaveErr, productSaveRes) {
						// Handle Product save error
						if (productSaveErr) done(productSaveErr);

						// Get a list of Products
						agent.get('/api/products')
							.end(function(productsGetErr, productsGetRes) {
								// Handle Product save error
								if (productsGetErr) done(productsGetErr);

								// Get Products list
								var products = productsGetRes.body;

								// Set assertions
								(products[0].user._id).should.equal(userId);
								(products[0].name).should.match('Product Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Product instance if not logged in', function(done) {
		agent.post('/api/products')
			.send(product)
			.expect(403)
			.end(function(productSaveErr, productSaveRes) {
				// Call the assertion callback
				done(productSaveErr);
			});
	});

	it('should not be able to save Product instance if no name is provided', function(done) {
		// Invalidate name field
		product.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Product
				agent.post('/api/products')
					.send(product)
					.expect(400)
					.end(function(productSaveErr, productSaveRes) {
						// Set message assertion
						(productSaveRes.body.message).should.match('Please fill Product name');
						
						// Handle Product save error
						done(productSaveErr);
					});
			});
	});

	it('should be able to update Product instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Product
				agent.post('/api/products')
					.send(product)
					.expect(200)
					.end(function(productSaveErr, productSaveRes) {
						// Handle Product save error
						if (productSaveErr) done(productSaveErr);

						// Update Product name
						product.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Product
						agent.put('/api/products/' + productSaveRes.body._id)
							.send(product)
							.expect(200)
							.end(function(productUpdateErr, productUpdateRes) {
								// Handle Product update error
								if (productUpdateErr) done(productUpdateErr);

								// Set assertions
								(productUpdateRes.body._id).should.equal(productSaveRes.body._id);
								(productUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Products if not signed in', function(done) {
		// Create new Product model instance
		var productObj = new Product(product);

		// Save the Product
		productObj.save(function() {
			// Request Products
			request(app).get('/api/products')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Product if not signed in', function(done) {
		// Create new Product model instance
		var productObj = new Product(product);

		// Save the Product
		productObj.save(function() {
			request(app).get('/api/products/' + productObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', product.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Product instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Product
				agent.post('/api/products')
					.send(product)
					.expect(200)
					.end(function(productSaveErr, productSaveRes) {
						// Handle Product save error
						if (productSaveErr) done(productSaveErr);

						// Delete existing Product
						agent.delete('/api/products/' + productSaveRes.body._id)
							.send(product)
							.expect(200)
							.end(function(productDeleteErr, productDeleteRes) {
								// Handle Product error error
								if (productDeleteErr) done(productDeleteErr);

								// Set assertions
								(productDeleteRes.body._id).should.equal(productSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Product instance if not signed in', function(done) {
		// Set Product user 
		product.user = user;

		// Create new Product model instance
		var productObj = new Product(product);

		// Save the Product
		productObj.save(function() {
			// Try deleting Product
			request(app).delete('/api/products/' + productObj._id)
			.expect(403)
			.end(function(productDeleteErr, productDeleteRes) {
				// Set message assertion
				(productDeleteRes.body.message).should.match('User is not authorized');

				// Handle Product error error
				done(productDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Product.remove().exec(function(){
				done();
			});
		});
	});
});
