'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  path = require('path'),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fall = require('async-waterfall');

exports.create = function(req, res) {
  var product = new Product(req.body);
  product.user = req.user;
  product.created = new Date();
  product.costPerUnit = Math.round(product.costPerUnit * 100) / 100;

  product.save(function(err) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {
      res.jsonp(product);
    }
  });
};

exports.read = function(req, res) {
  res.jsonp(req.product);
};

exports.update = function(req, res) {

  var product = req.product;

  product = _.extend(product, req.body);

  if ((product.esProducto == true) && (product.esMateriaPrima == false) && (product.produccion.length > 0)) {

    calcularMonto(product, function(err, data) {
			if (err) return res.status(400).send({status: 'error', message: err});

			return res.jsonp(data);
    });
  } else {

    if ((product.esProducto == true) && (product.esMateriaPrima == false) && (product.produccion.length == 0)) {
      product.costPerUnit = 0;
      product.updated = new Date();
      product.unitsInStock = Math.round(product.unitsInStock * 100) / 100;
      product.costPerUnit = Math.round(product.costPerUnit * 100) / 100;
      product.save(function(err) {
        if (err) {
          console.log('Error al actualizar producto:', err);
        } else {
          res.jsonp(product);
        }
      });
    } else {
      product.updated = new Date();
      product.unitsInStock = Math.round(product.unitsInStock * 100) / 100;
      product.costPerUnit = Math.round(product.costPerUnit * 100) / 100;
      product.save(function(err) {
        if (err) {
          console.log('Error al actualizar producto:', err);
        } else {
          res.jsonp(product);
        }
      });
    }
  }
};

function calcularMonto(product, callback) {
	product.costPerUnit = 0;

	var tasks = [];

	product.produccion.forEach(function (entry) {
		var task = function (taskCallback) {
			productoConId(entry, function (err, changedProduccion) {
				if (err) return taskCallback(err);
				product.costPerUnit += changedProduccion.total;
				taskCallback();
			})
		};

		tasks.push(task);
	});

	fall(tasks, function (err) {
		console.log('fall done', err);
		if (err) return callback(err);
		saveProduct(product, function (err, changedProduct) {
			if (err) return callback(err);
			callback(null, changedProduct);
		})
	})

}


function saveProduct (product, callback) {
	product.updated = new Date();
	product.unitsInStock = Math.round(product.unitsInStock * 100) / 100;
	product.costPerUnit = Math.round(product.costPerUnit * 100) / 100;

	product.save(callback)
}

function productoConId(prod, callback) {
	Product.findById(prod.producto).populate('produccion.producto', 'name costPerUnit').exec(function (err, product) {
		if (err) return callback(err);

		prod.total = prod.cantidad * product.costPerUnit;
		callback(null, prod);
	})
}


function materiaConId(p, callback) {
  Product.findById(p._id).populate('user', 'displayName').populate('enterprise', 'name').exec(function(err, product) {
    if (!err) {
      console.log(p.unitsInStock, 'stock en callback');
      product.unitsInStock = p.unitsInStock;
      return callback(product);
    } else {
      console.log("error");
    }
  });
}

exports.delete = function(req, res) {
  var product = req.product;

  //subtract cost per unidad
  Product.find({'produccion.producto': product._id}).exec(function(err, products) {
    if (!err) {
      products.forEach(function(entry){
        var subTotal = 0;
        entry.produccion.forEach(function(production){
          if(production.producto == product._id){
            subTotal = production.total;
          }
        });
        entry.costPerUnit = entry.costPerUnit - subTotal;
        entry.save();
      });
    }
  });

  //delete material from products 
  Product.update({"produccion.producto": product._id}, { $pull: {produccion: { producto: product._id }}}, 
    {safe: true, multi: true},
    function(err, doc){
      console.log(err,doc)
    }
  );

  product.deleted = true;
  product.save(function(err) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {
      res.jsonp(product);
    }
  });
};

exports.list = function(req, res) {
  var enterprise = req.query.e || null;
  var categoryOfPrice = req.query.c || null;
  var pagina = parseInt(req.query.p) >=0 ? parseInt(req.query.p): parseInt(req.query.p) || null;
  var limite = parseInt(req.query.pcount) || 2;  

  if (enterprise !== null) {
    var query = {enterprise: enterprise};
    if( categoryOfPrice !== null ){
      query = {enterprise: enterprise, 'catPrice.category': categoryOfPrice};
    }
    if ( pagina !== null ) {
      
      Product.find(query).skip(pagina).limit(limite).sort('-created').populate('user', 'displayName').populate('enterprise', 'name').populate('sub', 'name')
      //.populate('category1')
      .populate('category2').populate('provider').populate('product', 'name costPerUnit').populate('productosAgregados.producto', 'name').populate('produccion', 'producto name costPerUnit').populate('produccion.producto', 'name costPerUnit').exec(function(err, products) {
        if (err) {
          console.log("[E] error buscando productos: ", err);
          return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
          res.jsonp(products);
        }
      });
    } else {
      Product.find(query).sort('-created').populate('user', 'displayName').populate('enterprise', 'name').populate('sub', 'name')
      //.populate('category1')
      .populate('category2').populate('provider').populate('product', 'name costPerUnit').populate('productosAgregados.producto', 'name').populate('produccion', 'producto name costPerUnit').populate('produccion.producto', 'name costPerUnit').exec(function(err, products) {
        if (err) {
          console.log("[E] error buscando productos: ", err);
          return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
          res.jsonp(products);
        }
      });
    }   
  } else {
    Product.find().skip(pagina).limit(limite).sort('-created').populate('user', 'displayName').populate('enterprise', 'name').populate('sub', 'name')
    //.populate('category1')
      .populate('category2').populate('provider').populate('productosAgregados.producto', 'name').populate('product', 'name').exec(function(err, products) {
      if (err) {
        return res.status(400).send({message: errorHandler.getErrorMessage(err)});
      } else {
        res.jsonp(products);
      }
    });
  }
};

exports.listMostrador = function(req, res) {
    var enterprise = req.query.e;
    var categoryOfPrice = req.query.c || null;
    var query = {enterprise: enterprise, esProducto: true, deleted: false};
    if(categoryOfPrice !== null){
      query = {enterprise: enterprise, esProducto: true, deleted: false, 'catPrice.category': categoryOfPrice};
    }

    Product.find(query).sort('name').populate('user', 'displayName').populate('enterprise', 'name').populate('sub', 'name')
    //.populate('category1')
        .populate('category2').populate('provider').populate('product', 'name costPerUnit').populate('productosAgregados.producto', 'name').populate('produccion', 'producto name costPerUnit').populate('produccion.producto', 'name costPerUnit').exec(function(err, products) {
        if (err) {
            console.log("[E] error buscando productos: ", err);
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(products);
        }
    });
};

exports.productByID = function(req, res, next, id) {
  Product.findById(id).populate('user', 'displayName').populate('enterprise', 'name').populate('sub', 'name')
  //.populate('category1')
    .populate('category2').populate('provider', 'name').populate('product', 'name costPerUnit produccion').populate('produccion', 'producto name costPerUnit').populate('produccion.producto', 'name costPerUnit metric category2').populate('productosAgregados.producto', 'name').populate('product', 'name').exec(function(err, product) {
    if (err)
      return next(err);
    if (!product)
      return next(new Error('Failed to load Product ' + id));
    req.product = product;
    next();
  });
};
