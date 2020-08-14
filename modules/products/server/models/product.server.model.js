'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Product Schema
 */
var ProductSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	code: {
		type: String
	},
	description: {
		type: String,
		default: '',
		trim: true
	},
	brandName: {
		type: String,
		trim: true
	},
	unitPrice: {
		type: Number,
		default: 0
	},
	catPrice: [{
		category: {
			type: String,
			ref: 'Category'
		},
		catName:{
			type: String
		},
		price: {
			type: String,
			default: 0
		}
    }],
	provider: {
		type: String,
		ref: 'Provider'
	},
	costPerUnit: {
		type: Number,
		default: 0
	},
	stocks: [{
		costCenter: {
			type: String,
			ref: 'Costcenter'
		},
		unitsInStock: {
			type: Number,
			default: 0
		},
		idealStock: {
			type: Number
		},
		criticalStock: {
			type: Number
		},
	}],
	costoVariable: {
		type: Number,
		default: 0
	},
	storedIn: {
		type: String
	},
	metric: { // To do: hacer que apunte a una nueva colección
		type: String
	},
	reseller: { // si es falso indica que es de fabricación propia
		type: Boolean,
		default: false
	},
	esMateriaPrima: { // materia prima (no se si es correcta la traducción :P)
		type: Boolean,
		default: false
	},
	esProducto: {
		type: Boolean,
		default: false
	},
	esInsumo: {
		type: Boolean,
		default: false
	},
	produccion: [{
		producto: {
			type: String,
			ref: 'Product'
		},
		nombre: {
			type: String
		},
		cantidad: {
			type: Number,
			default: 0
		},
		total: {
			type: Number,
			default: 0
		}
    }],
	tax: {
		type: Number,
		default: 21
	},
	status: {
		type: String,
		enum: ['active', 'deleted'],
		default: 'active'
	},
	enterprise: {
		type: String,
		ref: 'Enterprise'
	},
	category1: {
		type: String,
		ref: 'Category'
	},
	category2: {
		type: String,
		ref: 'Category'
	},
	category3: {
		type: String,
		ref: 'Category'
	},
	category4: {
		type: String,
		ref: 'Category'
	},
	category5: {
		type: String,
		ref: 'Category'
	},
	created: {
		type: Date,
		default: Date.now
	},
	updated: {
		type: Date
	},
	deleted:{
		type: Boolean,
		default: false
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

ProductSchema.virtual('stockState').get(function () {

	if(this.unitsInStock <= this.criticalStock) {
		return { color: 'red', percentage: (this.unitsInStock * 100) / this.idealStock };
	} else if (this.unitsInStock >= this.idealStock) {
		return { color: 'green', percentage: 100 };
	} else {
		return { color: 'yellow', percentage: (this.unitsInStock * 100) / this.idealStock };
	}
});

mongoose.model('Product', ProductSchema);
