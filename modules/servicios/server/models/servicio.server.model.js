'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Servicio Schema
 */

var ServicioSchema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  descripcion: {
    type: String,
    default: '',
    trim: true
  },
  pagoAcumulados: {
    type: Number,
    default: 0
  },
  costcenters: [{
    type: String,
    ref: 'Costcenter'
  }],
  costosindirectos: {
    type: String,
    ref: 'Sucursal'
  },
  enterprise: {
    type: String,
    ref: 'Enterprise'
  },
  deleted:{
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
  operacion: {
    type: Array,
    default: []
  }
});

mongoose.model('Servicio', ServicioSchema);
