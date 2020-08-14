'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Condicionventa Schema
 */
var CondicionventaSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Por favor ingrese un nombre de condición de venta',
		trim: true
	},
	description: {
		type: String
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
});

mongoose.model('Condicionventa', CondicionventaSchema);