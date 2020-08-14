'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Proceso Schema
 */
var ProcesoSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Por favor indique un nombre para el proceso',
		trim: true
	},
	procedimientos: [{
		orden: {
			type: Number,
			default: 1
		},
        procedimiento: { 
        	type: String,
        	ref: 'Procedimiento'
        }
    }],
    category: {
        type: String,
        ref: 'Category'
    },
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	created: {
		type: Date,
		default: Date.now
	},
	deleted:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Proceso', ProcesoSchema);