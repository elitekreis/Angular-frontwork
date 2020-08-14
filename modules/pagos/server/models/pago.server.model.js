'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Pago Schema
 */
var PagoSchema = new Schema({
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
    cajaD: {
        type: String,
        ref: 'Caja'
    },
    montoE: {
        type: Number,
        default: 0
    },
    montoC: {
        type: Number,
        default: 0
    },
    saldo: {
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
    pagoDate: {
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
    type: {
        type: String
    },
    userLogin:{
        type:String
    },
    concepto: {
        _id: {
            type: String
        },
        name: {
            type: String
        },
        unit: {
            type: String
        },
        total: {
            type: Number,
            default: 0
        }
    }
});

mongoose.model('Pago', PagoSchema);
