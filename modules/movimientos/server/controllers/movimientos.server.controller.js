'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Movimiento = mongoose.model('Movimiento'),
	Caja = mongoose.model('Caja'),
	Condicionventa = mongoose.model('Condicionventa'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var movimiento = new Movimiento(req.body);
	movimiento.user = req.user;

	if (movimiento.caja !== undefined){
		condicionConId(movimiento.condicion, function(condicion){
			cajaConId(movimiento.caja, function(c){
				actualizarCaja(c,condicion,movimiento);
			})
		})
	}

	movimiento.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(movimiento);
		}
	});
};

function actualizarCaja(c,condicion,movimiento){
	if (movimiento.estado == 'haber'){
		if (condicion.name == 'Cheque'){
			c.cheques = c.cheques - movimiento.monto;
		}
		else{
			if (condicion.name == 'Efectivo'){
				c.efectivo = c.efectivo - movimiento.monto;
			}
			else{
				if(condicion.name == 'Tarjeta de Credito'){
					c.credito = c.credito - movimiento.monto;
				}
				else{
					if (condicion.name == 'Tarjeta de Debito'){
						c.debito = c.debito - movimiento.monto;
					}
				}
			}
		}
	}
	else{
		if (condicion.name == 'Cheque'){
			c.cheques = c.cheques + movimiento.monto;
		}
		else{
			if (condicion.name == 'Efectivo'){
				c.efectivo = c.efectivo + movimiento.monto;
			}
			else{
				if(condicion.name == 'Tarjeta de Credito'){
					c.credito = c.credito + movimiento.monto;
				}
				else{
					if (condicion.name == 'Tarjeta de Debito'){
						c.debito = c.debito + movimiento.monto;
					}
				}
			}
		}
	}
	c.total = c.cheques + c.efectivo + c.debito + c.debito;
	c.save(function(err) {
		if (err) {
			console.log(err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('Caja actualizada ok');
		}
	});
}

/**
 * Show the current Comprobante
 */
exports.read = function(req, res) {
	res.jsonp(req.movimiento);
};

/**
 * Update a Comprobante
 */
exports.update = function(req, res) {
	var movimiento = req.movimiento ;

	movimiento = _.extend(movimiento , req.body);

	movimiento.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(movimiento);
		}
	});
};

/**
 * Delete an Comprobante
 */
exports.delete = function(req, res) {
	var movimiento = req.movimiento ;
	movimiento.deleted = true;
	movimiento.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(movimiento);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	var estado = req.query.estado || null;
	if (enterprise !== null){
		Movimiento.find({enterprise: enterprise})
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('comprobante', 'name')
		.populate('client', 'name')
		.populate('provider', 'name')
		.exec(function(err, movimientos) {


			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(movimientos);
			}
		});
	}
	else{
		Movimiento.find()
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('comprobante', 'name')
		.exec(function(err, movimiento) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(movimiento);
			}
		});
	}
};

exports.loadMoreByDate = function(req, res) {

	var enterprise	= req.query.e || null;
	var estado		= req.query.estado || null;
	var cajaId 		= req.query.cajaid || null;
	var startdate	= req.query.start || null;
	var enddate 	= req.query.end || null;
			
	if (enterprise !== null){
		Movimiento.find({enterprise: enterprise, estado:estado, caja: cajaId, created: { $gte: startdate, $lte: enddate } })
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('comprobante', 'name')
		.populate('client', 'name')
		.populate('provider', 'name')
		.exec(function(err, movimientos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(movimientos);
			}
		});
	}
	else{
		Movimiento.find()
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('comprobante', 'name')
		.exec(function(err, movimiento) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(movimiento);
			}
		});
	}
};

exports.loadMore = function(req, res) {

	console.log("============Movimiento================");

	var enterprise	= req.query.e || null;
	var estado		= req.query.estado || null;
	var cajaId 		= req.query.cajaid || null;
	var limit 		= req.query.limit || null;
	var pagina 		= parseInt(req.query.p) || 0;
	console.log("enterprise",enterprise);
	if (enterprise !== null){
		Movimiento.find({enterprise: enterprise, estado:estado, caja: cajaId})
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('comprobante', 'name')
		.populate('client', 'name')
		.populate('provider', 'name')
		.exec(function(err, movimientos) {

			console.log("=================  movimientos   =====================");
			console.log(movimientos);
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(movimientos);
			}
		});
	}
	else{
		Movimiento.find()
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('comprobante', 'name')
		.exec(function(err, movimiento) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(movimiento);
			}
		});
	}
};


/**
 * Comprobante middleware
 */
exports.movimientoByID = function(req, res, next, id) {
	Movimiento.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('comprobante', 'name')
	.populate('client', 'name')
	.populate('provider', 'name')
	.exec(function(err, movimiento) {
		if (err) return next(err);
		if (! movimiento) return next(new Error('Failed to load movimiento ' + id));
		req.movimiento = movimiento ;
		next();
	});
};

function cajaConId(c, callback){
	Caja.findById(c)
	.exec(function(err, caja) {
		if (!err) {
			return callback(caja);
		} else {
			console.log("error");
		}
	});
};

function condicionConId(c, callback){
	Condicionventa.findById(c)
	.exec(function(err, condicion) {
		if (!err) {
			return callback(condicion);
		} else {
			console.log("error");
		}
	});
};
