'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * factura Schema
 */
var FacturaSchema = new Schema({
    numero: {
        type: Number,
        default: 0
    },
    servicios: {
        type: String,
        ref: 'Servicio'
    },
    impuestos: {
        type: String,
        ref: 'Impuesto'
    },
    personal: {
        type: String,
        ref: 'Empleado'
    },
    serviceName: {
        type: String,
    },
    cajaD: {
        type: String,
        ref: 'Caja'
    },
    centroId: {
        type: String,
        default: ""
    },
    montoE: {
        type: Number,
        default: 0
    },    
    month: {
        type: String,
        default: new Date().getMonth()
    },
    year: {
        type: String,
        default: new Date().getFullYear()
    },
    facturaDate: {
        type: Date,
        default: Date.now
    },
    observaciones: {
        type: String,
        default: ''
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    deleted: {
        type: Boolean,
        default: false
    },
    created: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    total: {
        type: Number,
        default: 0
    },
    type: {
        type: String
    },
    title1: {
        type: String,
        default:""
    },
    title2: {
        type: String,
        default: ""
    },
    title2Id: {
        type: String,
        default:""
    },
    saldo: {
        type: Number,
        default: 0
    }
    
});

mongoose.model('Facturado', FacturaSchema);
