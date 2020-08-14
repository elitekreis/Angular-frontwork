'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Comprobante Schema
 */
var ComprobanteSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Por favor ingrese un nombre de comprobante de venta',
        trim: true
    },
    letra: {
        type: String,
        trim: true,
        required: 'Por favor ingrese una letra que identifique al comprobante'
    },

    puntoDeVenta: {
        type: String
    },
    ultimoNumero: {
        type: Number,
        default: 0
    },
    movimientoStock: {
        type: Boolean,
        default: false
    },
    movimientoCC: {
        type: Boolean,
        default: false
    },
    movimientoOperacionInversa: {
        type: Boolean,
        default: false
    },
    funcionalidadSituacion: {
        type: Boolean,
        default: false
    },
    modoFacturacion: {
        type: String,
        enum: ['Comprobante interno', 'Talonario fiscal manual o pre-impreso', 'Factura electronica']
    },
    autoAprobar: {
        type: Boolean,
        default: true
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

mongoose.model('Comprobante', ComprobanteSchema);