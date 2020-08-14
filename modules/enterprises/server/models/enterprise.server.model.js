'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Enterprise Schema
 */
var EnterpriseSchema = new Schema({
	name: { // razón social
		type: String,
		default: '',
		required: 'Por favor indique el nombre de Empresa',
		trim: true
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	fiscalNumber: {
		type: String,
		trim: true
	},
	taxCondition: { // condicion frente al iva: Responsable Inscripto / Monotributista / Exento / No Responsable / Consumidor final
		type: String,
		default: 'Consumidor final'
	},
    // country: {
    //         type: String,
    //  },
    //  city: {//bsas
    //     type: String,
    //     //required: 'Por favor complete el campo Ciudad'
    // },
    region: { //lp
        type: String,
        //required: 'Por favor complete el campo Region'
    },
    postalCode: {
        type: String
    },
    address: {
        type: String,
        //required: 'Por favor complete el campo Dirección'
    },
    loc: {
        type: [Number],
        index: '2d'
    },
    phone: {
        type: String
    },
    email: {
        type: String,
        trim: true
    },
    fax: {
        type: String
    },
    web: {
        type: String
    },
	created: {
		type: Date,
		default: Date.now
	},
	status: {
		type: String,
		default: 'active'
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

EnterpriseSchema.virtual('enterprise').get(function () {
    return this._id.toString();
});

mongoose.model('Enterprise', EnterpriseSchema);
