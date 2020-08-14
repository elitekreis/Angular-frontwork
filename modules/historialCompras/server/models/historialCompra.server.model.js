'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Compra Schema
 */
var HistorialComprasSchema = new Schema({
	compra: {
		type: Object
	},
	fechaModificacion: { // fecha de delivery
		type: Date,
		default: Date.now
	},
	modificadoPor: {
		type: String,
		ref: 'User'
	}
});

mongoose.model('HistorialCompras', HistorialComprasSchema);