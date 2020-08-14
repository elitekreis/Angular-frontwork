'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Comprobante Schema
 */
var ArqueoSchema = new Schema({
	numero: {
		type: Number,
		default: 0
	},
	operacion: {
		type: String,
		enum: ['Ajustes','Apertura de Caja', 'Cierre de Caja']
	},
	observaciones: {
		type: String,
		default: '',
		trim: true
	},
	efectivo: {
		type: Number,
		default: 0
	},
	cheques: {
		type: Number,
		default: 0
	},
	debito: {
		type: Number,
		default: 0
	},
	credito: {
		type: Number,
		default: 0
	},
	dolares: {
		type: Number,
		default: 0
	},
	efectivoAjuste: {
		type: Number,
		default: 0
	},
	chequesAjuste: {
		type: Number,
		default: 0
	},
	debitoAjuste: {
		type: Number,
		default: 0
	},
	creditoAjuste: {
		type: Number,
		default: 0
	},
	dolaresAjuste: {
		type: Number,
		default: 0
	},
	ajuste: {
		type: Number,
		default: 0
	},
	total: {
		type: Number,
		default: 0
	},
	caja: {
		type: String,
		ref: 'Caja'
	},
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

mongoose.model('Arqueo', ArqueoSchema);
