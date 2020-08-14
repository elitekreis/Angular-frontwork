'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Product Schema
 */
var RemuneracioneSchema = new Schema({
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
	category : {
		type: String,
		ref: 'Category'
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	deleted:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	unit: {
		type: String,
		default: "U"
	}
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Remuneracione', RemuneracioneSchema);
