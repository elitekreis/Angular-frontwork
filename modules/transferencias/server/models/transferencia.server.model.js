'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Comprobante Schema
 */
var TransferenciaSchema = new Schema({
    numero: {
        type: Number,
        default: 0
    },
    cajaO: {
        type: String,
        ref: 'Caja'
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
    montoTC: {
        type: Number,
        default: 0
    },
    montoTD: {
        type: Number,
        default: 0
    },
    montoD: {
        type: Number,
        default: 0
    },
    saldo: {
        type: Number,
        default: 0
    },
    saldoDestino: {
        type: Number,
        default: 0
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
    }
});

mongoose.model('Transferencia', TransferenciaSchema);