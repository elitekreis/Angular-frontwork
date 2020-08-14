'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Category Schema
 */
var CategorySchema = new Schema({
    name: {
        type: String,
        default: '',
        trim: true
    },
    type1: {
        type: String,
        enum: ['Centro de Costo', 'Tipo de Venta', 'Tipo de Compra' ,'Cliente', 'Contacto', 'Insumo', 'Materia Prima', 'Producto', 'Producto Interno', 'Proveedor', 'Proceso' , 'Remuneracione']
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    sub: {
        type: String,
        ref: 'Sub'
    },
    created: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    mostrador: {
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

CategorySchema.virtual('category').get(function() {
    return this._id;
});

mongoose.model('Category', CategorySchema);