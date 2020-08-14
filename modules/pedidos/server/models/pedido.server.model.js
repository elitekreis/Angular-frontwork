'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Pedido Schema
 */
var PedidoSchema = new Schema({
    numero: {
        type: String,
        trim: true
    },
    tipoPedido: {
        type: String,
        enum: ['compra', 'venta']
    },
    puesto: {
        type: String,
        ref: 'Puesto'
    },
    tipoComprobante: {
        type: String,
        ref: 'Comprobante'
    },
    caja: {
        type: String,
        ref: 'Caja'
    },
    estado: {
        type: String,
        enum: ['borrador', 'pendiente evaluacion', 'pendiente aprobacion', 'rechazada', 'aprobada']
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
    llamado: {
        type: Boolean,

        default: false
    },
    cliente: {
        type: String,
        ref: 'Cliente'
    },
    delivery: { // si es falso indica que la orden no es para delivery
        type: Boolean,
        default: false
    },
    category1: {
        type: String,
        ref: 'Category'
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
        type: Number, // iva 27%
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
    condicionVenta: {
        type: String,
        ref: 'Condicionventa'
    },
    enterprise: {
        type: String,
        ref: 'Enterprise'
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
    myDate: {
        type: Date,
        default: Date.now
    },
    myDateChanged: {
        type: Boolean,
        default: false
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
    },
    impuesto: {
        type: Boolean,
        default: true
    }
});

mongoose.model('Pedido', PedidoSchema);