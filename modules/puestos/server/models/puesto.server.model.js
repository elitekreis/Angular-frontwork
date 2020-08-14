'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Puesto Schema
 */
var PuestoSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Please fill Puesto name',
        trim: true
    },
    area: {
        type: String,
        ref: 'Area'
    },
    // sub: {
    // 	type: String,
    // 	ref: 'Sub'
    // },
    centroDeCosto: {
        type: String,
        ref: 'Costcenter',
        required: 'Please choose a centro de costo'
    },
    horarioE: {
        type: String
    },
    horarioS: {
        type: String
    },
    porcentajeVentas: {
        type: Number,
        default: 0
    },
    sueldo: {
        type: Number
    },
    totalImpuestos: {
        type: Number
    },
    parent: {
        type: String,
        ref: 'Puesto'
    },
    procedimientos: [{
        type: String,
        ref: 'Procedimiento'
    }],
    interaccion: [{
        type: String,
        ref: 'Puesto'
    }],
    responsabilidades: {
        type: String,
        default: '',
        trim: false
    },
    requerimientos: {
        type: String,
        default: '',
        trim: false
    },
    tareas: {
        type: String,
        default: '',
        trim: false
    },
    criterios: {
        type: String,
        default: '',
        trim: false
    },
    objetivos: {
        type: String,
        default: '',
        trim: false
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    estado: {
        type: String,
        enum: ['Ocupado', 'Libre', 'Sin Especificar'],
        default: 'Sin Especificar'
    },
    personal: {
        type: String,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Puesto', PuestoSchema);