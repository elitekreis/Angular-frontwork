'use strict';

module.exports = function(app) {
	var posts = require('../controllers/posts.server.controller');
	var postsPolicy = require('../policies/posts.server.policy');

	// Posts Routes
	app.route('/api/posts').all()
		.get(posts.list).all(postsPolicy.isAllowed)
		.post(posts.create);

	app.route('/api/posts/:postId').all(postsPolicy.isAllowed)
		.get(posts.read)
		.put(posts.update)
		.delete(posts.delete);

	app.route('/api/posts/:postId/comments').all(postsPolicy.isAllowed)
		.post(posts.createComment)

	// Finish by binding the Post middleware
	app.param('postId', posts.postByID);
};