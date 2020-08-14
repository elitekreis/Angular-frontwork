'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Stock = mongoose.model('Stock'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, stock;

/**
 * Stock routes tests
 */
describe('Stock CRUD tests', function() {
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

		// Save a user to the test db and create new Stock
		user.save(function() {
			stock = {
				name: 'Stock Name'
			};

			done();
		});
	});

	it('should be able to save Stock instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Stock
				agent.post('/api/stocks')
					.send(stock)
					.expect(200)
					.end(function(stockSaveErr, stockSaveRes) {
						// Handle Stock save error
						if (stockSaveErr) done(stockSaveErr);

						// Get a list of Stocks
						agent.get('/api/stocks')
							.end(function(stocksGetErr, stocksGetRes) {
								// Handle Stock save error
								if (stocksGetErr) done(stocksGetErr);

								// Get Stocks list
								var stocks = stocksGetRes.body;

								// Set assertions
								(stocks[0].user._id).should.equal(userId);
								(stocks[0].name).should.match('Stock Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Stock instance if not logged in', function(done) {
		agent.post('/api/stocks')
			.send(stock)
			.expect(403)
			.end(function(stockSaveErr, stockSaveRes) {
				// Call the assertion callback
				done(stockSaveErr);
			});
	});

	it('should not be able to save Stock instance if no name is provided', function(done) {
		// Invalidate name field
		stock.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Stock
				agent.post('/api/stocks')
					.send(stock)
					.expect(400)
					.end(function(stockSaveErr, stockSaveRes) {
						// Set message assertion
						(stockSaveRes.body.message).should.match('Please fill Stock name');
						
						// Handle Stock save error
						done(stockSaveErr);
					});
			});
	});

	it('should be able to update Stock instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Stock
				agent.post('/api/stocks')
					.send(stock)
					.expect(200)
					.end(function(stockSaveErr, stockSaveRes) {
						// Handle Stock save error
						if (stockSaveErr) done(stockSaveErr);

						// Update Stock name
						stock.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Stock
						agent.put('/api/stocks/' + stockSaveRes.body._id)
							.send(stock)
							.expect(200)
							.end(function(stockUpdateErr, stockUpdateRes) {
								// Handle Stock update error
								if (stockUpdateErr) done(stockUpdateErr);

								// Set assertions
								(stockUpdateRes.body._id).should.equal(stockSaveRes.body._id);
								(stockUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Stocks if not signed in', function(done) {
		// Create new Stock model instance
		var stockObj = new Stock(stock);

		// Save the Stock
		stockObj.save(function() {
			// Request Stocks
			request(app).get('/api/stocks')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Stock if not signed in', function(done) {
		// Create new Stock model instance
		var stockObj = new Stock(stock);

		// Save the Stock
		stockObj.save(function() {
			request(app).get('/api/stocks/' + stockObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', stock.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Stock instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Stock
				agent.post('/api/stocks')
					.send(stock)
					.expect(200)
					.end(function(stockSaveErr, stockSaveRes) {
						// Handle Stock save error
						if (stockSaveErr) done(stockSaveErr);

						// Delete existing Stock
						agent.delete('/api/stocks/' + stockSaveRes.body._id)
							.send(stock)
							.expect(200)
							.end(function(stockDeleteErr, stockDeleteRes) {
								// Handle Stock error error
								if (stockDeleteErr) done(stockDeleteErr);

								// Set assertions
								(stockDeleteRes.body._id).should.equal(stockSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Stock instance if not signed in', function(done) {
		// Set Stock user 
		stock.user = user;

		// Create new Stock model instance
		var stockObj = new Stock(stock);

		// Save the Stock
		stockObj.save(function() {
			// Try deleting Stock
			request(app).delete('/api/stocks/' + stockObj._id)
			.expect(403)
			.end(function(stockDeleteErr, stockDeleteRes) {
				// Set message assertion
				(stockDeleteRes.body.message).should.match('User is not authorized');

				// Handle Stock error error
				done(stockDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Stock.remove().exec(function(){
				done();
			});
		});
	});
});
