'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Tarea Schema
 */
var TareaSchema = new Schema({
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	created: {
		type: Date,
		default: Date.now
	},
	descripcion: {
		type: String,
		default: ''
	},
	prioridad: {
		type: Boolean,
		default: false
	},
	deleted: {
		type: Boolean,
		default: false
	},
	realizado: {
		type: Boolean,
		default: false
	},
	usuario:{
		type: String,
		ref: 'User'
	},
	forMe:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Tarea', TareaSchema);
