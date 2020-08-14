'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	ObjectId = mongoose.Types.ObjectId,
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Post
 */
exports.create = function(req, res) {
	var post = new Post(req.body);
	post.user = req.user;

	post.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

exports.createComment = function(req, res) {
	var postId = req.params.postId;

	var comment = req.body;
	var commentId = new ObjectId();

	comment = {_id: commentId, user: req.user, created: new Date(), message: comment.message};

	Post.findById(postId)
	.exec(function(err, post) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			post.comments.push(comment);

			post.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(comment);
				}
			});
			//res.jsonp(post);
		}
	});
	
};

/**
 * Show the current Post
 */
exports.read = function(req, res) {
	res.jsonp(req.post);
};

/**
 * Update a Post
 */
exports.update = function(req, res) {
	var post = req.post ;

	post = _.extend(post , req.body);

	post.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

/**
 * Delete an Post
 */
exports.delete = function(req, res) {
	var post = req.post ;

	post.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

/**
 * List of Posts
 */
exports.list = function(req, res) { 
	Post.find().sort('-created')
	.populate('user')
	.exec(function(err, posts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(posts);
		}
	});
};

/**
 * Post middleware
 */
exports.postByID = function(req, res, next, id) { 
	Post.findById(id).populate('user', 'displayName')
	.exec(function(err, post) {
		if (err) return next(err);
		if (! post) return next(new Error('Failed to load Post ' + id));
		req.post = post ;
		next();
	});
};