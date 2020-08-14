'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Provider Schema
 */
var ProviderSchema = new Schema({
	name: { // razón social
        type: String,
        default: '',
        trim: true
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
    finanza: {
        type: String,
        ref: 'Finanza'
    },
    banco: {
        name: String,
        identity: String,
        account: String,
        cbu: String
    },
    discountRate: {
        type: Number,
        default: 0
    },
    loc: {
        type: [Number],
        index: '2d'
    },
    costCenter: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    sub: {
        type: String,
        ref: 'Sub'
    },
    category1: {
        type: String,
        ref: 'Category'
    },
    // contacts: [
    //     {
    //         type: String,
    //         ref: 'Contact'
    //     }
    // ],
    contact: {
        type: String
    },
    productosAsociados: [
        {
            type: String,
            ref: 'Product'
        }
    ],
    country: {
            type: String,
    },
    city: {//bsas
        type: String
    },
    region: { //lp
        type: String
    },
    postalCode: {
        type: String
    },
    address: {
        type: String
    },
    phone1: {
        type: String
    },
    phone2: {
        type: String
    },
    mail1: {
        type: String
    },
    mail2: {
        type: String
    },
    fax: {
        type: String
    },
    web: {
        type: String
    },
    impuesto1: {
        type: Number,
        default: 0  
    },
    impuesto2: {
        type: Number, 
        default: 0
    },
    impuesto3: {
        type: Number,
        default: 0 
    },
    impuesto4: {
        type: Number,
        default: 0 
    },
    observaciones: { // razón social
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
    deleted: {
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

ProviderSchema.virtual('provider').get(function () {
    return this._id;
});

mongoose.model('Provider', ProviderSchema);
