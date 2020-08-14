'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Actividad Schema
 */
var ActividadSchema = new Schema({
        operacion: {
            type: String,
            default: '',
            enum: ["Hola", "Chau", "Falta"]
        },
        observaciones: {
            type: String,
            default: ''
        },
        enterprise: {
            type: String,
            ref: 'Enterprise'
        },
        created: {
            type: Date,
            default: Date.now
        },
        empleado: {
            type: String,
            ref: 'Empleado'
        },
        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

mongoose.model('Actividad', ActividadSchema);
