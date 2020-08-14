'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Compra Schema
 */
var CompraSchema = new Schema({
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
    impuestoId: {
        type: String,
        ref: 'Impuesto'
    },
    tipoComprobante: {
        type: String,
        ref: 'Comprobante'
    },
    estado: {
        type: String,
        enum: ['Pendiente de pago y recepcion', 'Pendiente de pago2', 'Pendiente de recepcion', 'Finalizada', 'Anulada'],
        default: 'Pendiente de pago y recepcion'
    },

    products: [{
        product: {
            type: Object
        },
        cantidad: {
            type: Number,
            default: 1
        },
        descuento: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        observaciones: {
            type: String,
            trim: true
        }
    }],
    proveedor: {
        type: String,
        ref: 'Provider'
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
        type: Number
    },
    neto: {
        type: Number
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
        type: Number // iva 27%
    },
    totalTax: {
        type: Number,
        default: 0
    },
    totalImp: {
        type: Number,
        default: 0
    },
    total: {
        type: Number
    },
    saldoCaja: {
        type: Number,
        default: 0
    },
    condicionVenta: {
        type: String,
        ref: 'Condicionventa'
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
    },
    category: {
        type: String,
        ref: 'Category'
    },
    //ver que onda
    // sub: {
    //        type: String,
    //        ref: 'Sub'
    //    },
    historial: {
        type: String,
        ref: 'HistorialCompras'
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
    fechaAlta: {
        type: Date
    },
    fechaPago: {
        type: Date
    },
    fechaRecepcion: {
        type: Date
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Compra', CompraSchema);