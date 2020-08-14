'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Costosindirecto Schema
 */
var CostosindirectoSchema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  descripcion:{
    type: String
  },
  servicio: [{
    type: String,
    ref: 'Servicio'
  }],
  costcenters: {
    type: String,
    ref: 'Costcenter'
  },
  total: {
    type: Number,
    default: 0
  },
  efectivo: {
    type: Number,
    default: 0
  },
  cheques: {
    type: Number,
    default: 0
  },
  deleted:{
    type: Boolean,
    default: false
  },
  enterprise: {
    type: String,
    ref: 'Enterprise'
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
  
});

mongoose.model('Costosindirecto', CostosindirectoSchema);


