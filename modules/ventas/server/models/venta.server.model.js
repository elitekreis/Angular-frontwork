'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Venta Schema
 */
var VentaSchema = new Schema({
    comprobante: {
        type: String,
        trim: true
    },
    caja: {
        type: String,
        ref: 'Caja'
    },
    puesto: {
        type: String,
        ref: 'Puesto'
    },
    tipoComprobante: {
        type: String,
        ref: 'Comprobante'
    },
    orden: {
        type: String,
        ref: 'Pedido'
    },
    impuestoId: {
        type: String,
        ref: 'Impuesto'
    },
    estado: {
        type: String,
        enum: ['Pendiente de pago y entrega', 'Pendiente de pago2', 'Pendiente de entrega', 'Finalizada', 'Anulada'],
        default: 'Pendiente de pago y entrega'
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
    }],
    delivery: { // si es falso indica que la venta no es para delivery
        type: Boolean,
        default: false
    },
    myDate: { // fecha de delivery
        type: Date,
        default: Date.now
    },
    myDateChanged: {
        type: Boolean,
        default: false
    },
    observaciones: {
        type: String
    },
    subtotal: {
        type: Number
    },
    descuentoPorcentaje: {
        type: Number,
        default: 0
    },
    descuentoValor: {
        type: Number,
    },
    neto: {
        type: Number,
    },
    tax1: {
        type: Number, // iva 10.5%
        default: 0
    },
    tax2: {
        type: Number, // iva 21%
        default: 0
    },
    tax3: {
        type: Number, // iva 27%
    },
    totalTax: {
        type: Number, // iva 27%
    },
    total: {
        type: Number,
    },
    saldoCaja: {
        type: Number,
        default: 0
    },
    category1: {
        type: String,
        ref: 'Category'
    },
    condicionVenta: {
        type: String,
        ref: 'Condicionventa'
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    cliente: {
        type: String,
        ref: 'Cliente'
    },
    filterDate: {
        year: String, // 2015
        quarter: String, // 2015-1Q
        month: String, // 2015-07
        week: String, // 2015-29
        day: String, // 2015-191
        dayOfWeek: Number, // 3 (Miercoles)
        Hour: Number // 11
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
    },
    impuesto: {
        type: Boolean,
        default: false
    }
});

mongoose.model('Venta', VentaSchema);