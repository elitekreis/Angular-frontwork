'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Liquidacion Schema
 */
var LiquidacionSchema = new Schema({
	empleado: {
		type: String,
		ref: 'Empleado'
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	remuneraciones: [{
		_id: {
			type: String
		},
		name: {
			type: String
		},
		unit: {
			type: String
		},
		cantidad: {
			type: Number
		},
		total: {
			type: Number,
			default: 0
		}
	}],
	total: {
		type: Number
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
        type: Date,
        default: Date.now
	},
	fechaDeLiquidacion: {
		type: Date,
		default: Date.now
	},
	fechaDeLiquidacion2: {
		type: Date,
		default: Date.now
	},
	deleted:{
		type: Boolean,
		default: false
	},
	observaciones: {
		type: String,
		default: ''
	}
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

mongoose.model('Liquidacion', LiquidacionSchema);
