'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Area Schema
 */
var AreaSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	nivel: {
		type: Number
	},
	parent: {
		type: String,
		ref: 'Area'
	},
	sub: {
		type: String,
		ref: 'Sub'
	},
	objetivos: {
		type: String,
		default: '',
		trim: false
	},
	politicas: {
		type: String,
		default: '',
		trim: false
	},
	reglas: {
		type: String,
		default: '',
		trim: false
	},
	sectores: {
		type: String,
		default: '',
		trim: false
	},
	bienesUso: {
		type: String,
		default: '',
		trim: false
	},
	procesos:[{
		proceso: {
			type: Object,
		},
	}],
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

mongoose.model('Area', AreaSchema);