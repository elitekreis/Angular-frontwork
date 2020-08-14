'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Comprobante Schema
 */
var MovimientoSchema = new Schema({
	provider: {
		type: String,
		ref: 'Provider'
	},
	client: {
		type: String,
		ref: 'Cliente'
	},
	comprobante: {
		type: String,
		ref: 'Comprobante'
	},
	caja: {
		type: String,
		ref: 'Caja'
	},
	condicion: {
		type: String,
		ref: 'Condicionventa'
	},
	finanza: {
		type: String,
		ref: 'Finanza'
	},
	numero: {
		type: Number,
		default: 0
	},
	fecha: {
		type: Date,
		default: Date.now
	},
	estado: {
		type: String,
		enum: ['debe', 'haber']
	},
	monto: {
		type: Number,
		default: 0
	},
	saldo: {
		type: Number,
		default: 0
	},
	saldoCaja: {
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
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Movimiento', MovimientoSchema);
