'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Venta Schema
 */
var OutSchema = new Schema({
    total: {
        type: Number
    },
    puesto: {
        type: String,

    },
    products: [{
        product: {},
        cantidad: {
            type: Number,
            default: 1
        },
        descuento: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        totalSinD: {
            type: Number,
            default: 0
        },
        observaciones: {
            type: String,
            trim: true
        }
    }]
});

mongoose.model('Aggrout', OutSchema);