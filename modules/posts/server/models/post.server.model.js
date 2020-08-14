'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


/**
 * Comment Schema
 */
var CommentSchema = new Schema({
	message: {
		type: String,
	},
	email: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Object
	}
} );


/**
 * Post Schema
 */
var PostSchema = new Schema({
	message: {
		type: String,
	},
	email: {
		type: String
	},
	comments: [CommentSchema],
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Post', PostSchema);