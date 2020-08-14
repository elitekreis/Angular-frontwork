'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Comprobante Schema
 */
var FinanzaSchema = new Schema({
	tipoFinanza: {
		type: String,
		enum: ['debe', 'haber']
	},
	provider: {
		type: String,
		ref: 'Provider'
	},
	client: {
		type: String,
		ref: 'Cliente'
	},
	debe: {
		type: Number,
		default: 0
	},
	haber: {
		type: Number,
		default: 0
	},
	saldo: {
		type: Number,
		default: 0
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	deleted:{
		type: Boolean,
		default: false
	},
	created: {
		type: Date,
		default: Date.now
	},
	update: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Finanza', FinanzaSchema);