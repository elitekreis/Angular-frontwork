'use strict';

var should = require('should'),
	request = require('supertest'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Post = mongoose.model('Post'),
	express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, post;

/**
 * Post routes tests
 */
describe('Post CRUD tests', function() {
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

		// Save a user to the test db and create new Post
		user.save(function() {
			post = {
				name: 'Post Name'
			};

			done();
		});
	});

	it('should be able to save Post instance if logged in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Post
				agent.post('/api/posts')
					.send(post)
					.expect(200)
					.end(function(postSaveErr, postSaveRes) {
						// Handle Post save error
						if (postSaveErr) done(postSaveErr);

						// Get a list of Posts
						agent.get('/api/posts')
							.end(function(postsGetErr, postsGetRes) {
								// Handle Post save error
								if (postsGetErr) done(postsGetErr);

								// Get Posts list
								var posts = postsGetRes.body;

								// Set assertions
								(posts[0].user._id).should.equal(userId);
								(posts[0].name).should.match('Post Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Post instance if not logged in', function(done) {
		agent.post('/api/posts')
			.send(post)
			.expect(403)
			.end(function(postSaveErr, postSaveRes) {
				// Call the assertion callback
				done(postSaveErr);
			});
	});

	it('should not be able to save Post instance if no name is provided', function(done) {
		// Invalidate name field
		post.name = '';

		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Post
				agent.post('/api/posts')
					.send(post)
					.expect(400)
					.end(function(postSaveErr, postSaveRes) {
						// Set message assertion
						(postSaveRes.body.message).should.match('Please fill Post name');
						
						// Handle Post save error
						done(postSaveErr);
					});
			});
	});

	it('should be able to update Post instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Post
				agent.post('/api/posts')
					.send(post)
					.expect(200)
					.end(function(postSaveErr, postSaveRes) {
						// Handle Post save error
						if (postSaveErr) done(postSaveErr);

						// Update Post name
						post.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Post
						agent.put('/api/posts/' + postSaveRes.body._id)
							.send(post)
							.expect(200)
							.end(function(postUpdateErr, postUpdateRes) {
								// Handle Post update error
								if (postUpdateErr) done(postUpdateErr);

								// Set assertions
								(postUpdateRes.body._id).should.equal(postSaveRes.body._id);
								(postUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Posts if not signed in', function(done) {
		// Create new Post model instance
		var postObj = new Post(post);

		// Save the Post
		postObj.save(function() {
			// Request Posts
			request(app).get('/api/posts')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Post if not signed in', function(done) {
		// Create new Post model instance
		var postObj = new Post(post);

		// Save the Post
		postObj.save(function() {
			request(app).get('/api/posts/' + postObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', post.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Post instance if signed in', function(done) {
		agent.post('/api/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Post
				agent.post('/api/posts')
					.send(post)
					.expect(200)
					.end(function(postSaveErr, postSaveRes) {
						// Handle Post save error
						if (postSaveErr) done(postSaveErr);

						// Delete existing Post
						agent.delete('/api/posts/' + postSaveRes.body._id)
							.send(post)
							.expect(200)
							.end(function(postDeleteErr, postDeleteRes) {
								// Handle Post error error
								if (postDeleteErr) done(postDeleteErr);

								// Set assertions
								(postDeleteRes.body._id).should.equal(postSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Post instance if not signed in', function(done) {
		// Set Post user 
		post.user = user;

		// Create new Post model instance
		var postObj = new Post(post);

		// Save the Post
		postObj.save(function() {
			// Try deleting Post
			request(app).delete('/api/posts/' + postObj._id)
			.expect(403)
			.end(function(postDeleteErr, postDeleteRes) {
				// Set message assertion
				(postDeleteRes.body.message).should.match('User is not authorized');

				// Handle Post error error
				done(postDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec(function(){
			Post.remove().exec(function(){
				done();
			});
		});
	});
});
