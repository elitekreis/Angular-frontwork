'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Transferencia = mongoose.model('Transferencia'),
	Caja = mongoose.model('Caja'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var transferencia = new Transferencia(req.body);
	transferencia.user = req.user;

	transferencia.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			actualizarCajaOrigen(transferencia);
			actualizarCajaDestino(transferencia);
			res.jsonp(transferencia);
		}
	});
};

function actualizarCajaOrigen(t){
	// cajaConId(t.cajaO, function(c){
	Caja.findById(t.cajaO)
	.exec(function(err, c) {
		c.efectivo = c.efectivo - t.montoE;
		c.cheques = c.cheques - t.montoC;
		c.total = c.cheques + c.efectivo + c.debito + c.credito + c.dolares;
		c.save(function(err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				console.log('Caja transferencia origen actualizada ok');
			}
		});
	})
};

function actualizarCajaDestino(t){
	// cajaConId(t.cajaD, function(c){
	Caja.findById(t.cajaD)
	.exec(function(err, c) {
		c.efectivo = c.efectivo + t.montoE;
		c.cheques = c.cheques + t.montoC;
		c.total = c.cheques + c.efectivo + c.debito + c.credito + c.dolares;
		c.save(function(err) {
			if (err) {
				console.log(err, 'error');
			} else {
				console.log('Caja transferencia destino actualizada ok');
			}
		});
	})
};

/**
 * Show the current Comprobante
 */
exports.read = function(req, res) {
	res.jsonp(req.transferencia);
};

/**
 * Update a Comprobante
 */
exports.update = function(req, res) {
	var transferencia = req.transferencia ;

	transferencia = _.extend(transferencia , req.body);

	transferencia.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transferencia);
		}
	});
};

/**
 * Delete an Comprobante
 */
exports.delete = function(req, res) {
	var transferencia = req.transferencia;
	transferencia.deleted = true;
	transferencia.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transferencia);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Transferencia.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('cajaD')
		.populate('cajaO')
		.exec(function(err, transferencias) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(transferencias);
			}
		});
	}
	else{
		Transferencia.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, transferencias) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(transferencias);
			}
		});
	}
};

exports.loadmorebycaja = function(req, res) {
	
	var enterprise	= req.query.e || null;	
	var cajaId 		= req.query.caja || null;
	var limit 		= req.query.limit || null;
	var pagina 		= parseInt(req.query.pagina) || 0;

	if (enterprise !== null) {
		Transferencia.find({enterprise: enterprise, $or:[{cajaO: cajaId}, {cajaD: cajaId}] })
		.skip(pagina)
		.limit(limit)
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('cajaD')
		.populate('cajaO')
		.exec(function(err, transferencias) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(transferencias);
			}
		});
	}
	else{
		Transferencia.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, transferencias) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(transferencias);
			}
		});
	}
};

exports.loadmorebycaja_date = function(req, res) {
	
	var enterprise	= req.query.e || null;	
	var cajaId 		= req.query.caja || null;
	var startdate	= req.query.start || null;
	var enddate 	= req.query.end || null;

	if (enterprise !== null) {
		Transferencia.find({enterprise: enterprise, $or:[{cajaO: cajaId}, {cajaD: cajaId}], created: { $gte: startdate, $lte: enddate } })		
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('cajaD')
		.populate('cajaO')
		.exec(function(err, transferencias) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(transferencias);
			}
		});
	}
	else{
		Transferencia.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, transferencias) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(transferencias);
			}
		});
	}
};

function cajaConId(c, callback){
	Caja.findById(c)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, caja) {
		if (!err) {
			return callback(caja);
		} else {
			console.log("error");
		}
	});
};

/**
 * Comprobante middleware
 */
exports.transferenciaByID = function(req, res, next, id) {
	Transferencia.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	// .populate('cajaD', 'name')
	// .populate('cajaO', 'name')
	.exec(function(err, transferencia) {
		if (err) return next(err);
		if (! transferencia) return next(new Error('Failed to load transferencia ' + id));
		req.transferencia = transferencia ;
		next();
	});
};
