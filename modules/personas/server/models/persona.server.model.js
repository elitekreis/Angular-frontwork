'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Persona Schema
 */
var PersonaSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Persona name',
		trim: true
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
});

mongoose.model('Persona', PersonaSchema);