'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Costcenter Schema
 */
var CostcenterSchema = new Schema({
    name: {
        type: String,
        default: '',
        required: 'Por favor ingrese un nombre de centro de costo',
        trim: true
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        enum: ['activo', 'pasivo', 'patrimonio neto', 'negativo', 'ganancia'],
        default: 'pasivo'
    },
    category1: {
        type: String,
        ref: 'Category'
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
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
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});


CostcenterSchema.virtual('costcenter').get(function() {
    return this._id;
});

mongoose.model('Costcenter', CostcenterSchema);