'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * Contact Schema
 */
var ContactSchema = new Schema({
	firstName: {
		type: String,
		default: '',
		required: 'Por favor ingrese un nombre de contacto',
		trim: true
	},
	lastName: {
		type: String,
		default: '',
		required: 'Por favor ingrese un apellido de contacto',
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Por favor ingrese un email'],
		match: [/.+\@.+\..+/, 'Por favor ingrese un email válido']
	},
	observaciones: {
		type: String,
		default: '',
		trim: true
	},
	imageURL: {
		type: String,
		default: 'modules/users/img/profile/default.png'
	},
	status: {
		type: String,
		default: 'active'
	},
	loc: {
        type: [Number],
        index: '2d'
    },
	address: {
		type: String,
		trim: true
	},
	/*city: {
		type: String,
		trim: true
	},*/
	region: {
		type: String,
		trim: true
	},
	postalCode: {
		type: String,
		trim: true
	},
	// country: {
	// 	type: String,
	// 	trim: true
	// },
	phone: {
		type: String,
		trim: true
	},
	fax: {
		type: String,
		trim: true
	},
	web: {
		type: String,
		trim: true
	},
		created: {
		type: Date,
		default: Date.now
	},
	enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    sub: {
        type: String,
        ref: 'Sub'
    },
    deleted:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

ContactSchema.virtual('contact').get(function () {
    return this._id;
});

ContactSchema.virtual('displayName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

mongoose.model('Contact', ContactSchema);