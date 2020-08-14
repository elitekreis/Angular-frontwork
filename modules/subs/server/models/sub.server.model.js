'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Sub Schema
 */
var SubSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	goals: {
		type: String,
		default: '',
		trim: true
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	created: {
		type: Date,
		default: Date.now
	},
	deleted:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

SubSchema.virtual('sub').get(function () {
    return this._id;
});

mongoose.model('Sub', SubSchema);