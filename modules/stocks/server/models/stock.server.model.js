'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Stock Schema
 */
var StockSchema = new Schema({
	action: {
		type: String,
		enum: [ 'agregar', 'suprimir', 'pedido', 'pedido recibido'],
		required: 'No se especificó una acción'
	},
	amount: {
		type: Number
	},
	lastValue: {
		type: Number
	},
	newValue: {
		type: Number
	},
	product: {
		type: Object
	},
	received: {
		type: Boolean,
		default: false
	},
	reference: {
		type: String
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
	observations: {
		type: String,
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	costCenter: {
		type: Schema.ObjectId,
		ref: 'CostCenter'
	}
});

mongoose.model('Stock', StockSchema);