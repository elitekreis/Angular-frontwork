'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Rrhh Schema
 */
var RrhhSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Rrhh name',
		trim: true
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

mongoose.model('Rrhh', RrhhSchema);