'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Venta Schema
 */
var ReporteSchema = new Schema({
	name: {
		type: String,
		trim: true
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

mongoose.model('Reporte', ReporteSchema);
