'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Taxcondition Schema
 */
var TaxconditionSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Por favor ingrese el nombre de condición de IVA',
		trim: true
	},
	taxPercentage: {
		type: Number
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
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

TaxconditionSchema.virtual('taxCondition').get(function () {
    return this._id;
});

TaxconditionSchema.virtual('taxMultiplier').get(function () {
    return (1 + (this.taxPercentage / 100));
});

mongoose.model('Taxcondition', TaxconditionSchema);