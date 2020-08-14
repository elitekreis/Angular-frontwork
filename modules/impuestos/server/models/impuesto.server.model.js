'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Impuesto Schema
 */
var ImpuestoSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Impuesto name',
        trim: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    centroDeCosto: {
        type: Schema.ObjectId,
        ref: 'Costcenter'
    },
    descripcion: {
        type: String
    },
    type: {
        type: String
    },
    total: {
        type: Number,
        default: 0
    },
    coefficient: {
        type: Number,
        default: 0
    },
    automaticoType: {
        type: String
    },
    month: {
        type: String
    },
    year: {
        type: String
    },
    ajustars: {
        type: Schema.Types.Mixed
    }
});

mongoose.model('Impuesto', ImpuestoSchema);