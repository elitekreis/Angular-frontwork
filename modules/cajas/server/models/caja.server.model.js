'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Comprobante Schema
 */
var CajaSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	descripcion: {
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
	total: {
		type: Number,
		default: 0
	},
	puestos: [{
		type: String,
		ref: 'Puesto'
	}],
	sucursal: {
		type: String,
		ref: 'Sucursal'
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

mongoose.model('Caja', CajaSchema);