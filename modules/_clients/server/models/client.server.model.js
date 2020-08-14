'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Client Schema
 */
var ClienteSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
    apellido: { 
        type: String,
        default: '',
        trim: true
    },
    finanza: {
        type: String,
        ref: 'Finanza'
    },
	creditLimit: {
		type: Number,
		default: 0
	},
	fiscalNumber: {
		type: String,
		trim: true
	},
	taxCondition: { // condicion frente al iva: Responsable Inscripto / Monotributista / Exento / No Responsable / Consumidor final
		type: String,
        ref: 'Taxcondition'
	},
    condicionPago: {
        type: String,
        ref: 'Condicionventa'
    },
    comprobante: {
        type: String,
        ref: 'Comprobante'
    },
	discountRate: {
		type: Number,
		default: 0
	},
	costCenter: {
		type: String,
		trim: true
	},
	paymentMethod: {
		type: String,
	},
    category1: {
        type: String,
        ref: 'Category'
    },
    observaciones: {
        type: String
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    contacts: { 
        type: String,
        ref: 'Contact'
    },
    productosAsociados: [
        { 
            type: String,
            ref: 'Product'
        }
    ],
    loc: {
        type: [Number],
        index: '2d'
    },
    region: { //lp
        type: String
    },
    turno: { //lp
        type: String
    },
    postalCode: {
        type: String
    },
    address: {
        type: String
    },
    phone: {
        type: String
    },
    fax: {
        type: String
    },
    web: {
        type: String
    },
    mail: {
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
    isUser:{
        type: Boolean,
        default: false
    },
    userLogin: {
        type: String,
        ref: 'User'
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

ClienteSchema.virtual('cliente').get(function () {
    return this._id;
});

mongoose.model('Cliente', ClienteSchema);