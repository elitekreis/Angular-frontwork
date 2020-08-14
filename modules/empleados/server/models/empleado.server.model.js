'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Empleado Schema
 */
var EmpleadoSchema = new Schema({

	userLogin: {
        type: String,
        ref: 'User'
    },
  	puesto: {
		type: String,
		ref: 'Puesto'
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
    sueldo: {
        type: Number,
		default: 0
    },
	deleted:{
		type: Boolean,
		default: false
	},
	created: {
	    type: Date,
	    default: Date.now
  	}
});

mongoose.model('Empleado', EmpleadoSchema);
