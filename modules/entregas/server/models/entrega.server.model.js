'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Entrega Schema
 */
var EntregaSchema = new Schema({
	numero: {
		type: Number,
	},
	venta: {
		type: String,
		ref: 'Venta'
	},
	tipoComprobante: {
		type: String,
		ref: 'Comprobante'
	},
	fechaEntrega: {
		type: Date
	},
	estado: {
		type: String,
		enum: ['pendiente', 'entregada', 'rechazada', 'cancelada'],
		default: 'pendiente'
	},
	products: [{
		product: {
			type: Object,
		},
		cantidad: {
			type: Number,
			default: 1
		},
		descuento: {  
			type: Number,
			default:0
		},
		subtotal: {  
			type: Number,
			default:0
		},
		total: {  
			type: Number,
			default:0
		},
		observaciones: {
			type: String,
			trim: true
		}
	}],
	cliente: {
		type: String,
		ref: 'Cliente'
	},
	observaciones: {
		type: String
	},
	subtotal: {
		type: Number
	},
	neto: {
		type: Number,
	},
	tax1: {
		type: Number, // iva 10.5%
		default: 0  
	},
	tax2: {
		type: Number, // iva 21%
		default: 0
	},
	tax3: {
		type: Number, // iva 27%
	},
	totalTax: {
		type: Number,
		default: 0
	},
	total: {
		type: Number,
	},
	condicionVenta: {
		type: String,
		ref: 'Condicionventa'
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	filterDate: {
		year: String, 		// 2015
		quarter: String, 	// 2015-1Q
		month: String, 		// 2015-07
		week: String, 		// 2015-29
		day: String,		// 2015-191
		dayOfWeek: Number,	// 3 (Miercoles)
		Hour: Number 		// 11
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

mongoose.model('Entrega', EntregaSchema);