'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Arqueo = mongoose.model('Arqueo'),
	Transferencia = mongoose.model('Transferencia'),
	Caja = mongoose.model('Caja'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var arqueo = new Arqueo(req.body);
	arqueo.user = req.user;

	actualizarCaja(arqueo);

	arqueo.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(arqueo);
		}
	});
};



function actualizarCaja (arqueo){
	// cajaConId(arqueo.caja, function(c){
	Caja.findById(arqueo.caja)
	.exec(function(err, c) {
		c.total = arqueo.total;
		c.efectivo = arqueo.efectivo;
		c.cheques = arqueo.cheques;
		c.credito = arqueo.credito;
		c.debito = arqueo.debito;
		c.dolares = arqueo.dolares;
		c.save(function(err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				console.log('Caja arqueo actualizada ok1');
			}
		});
	})
};

/**
 * Show the current caja
 */
exports.read = function(req, res) {
	res.jsonp(req.arqueo);
};

/**
 * Update a caja
 */
exports.update = function(req, res) {
	var arqueo = req.arqueo ;

	arqueo = _.extend(arqueo , req.body);

	arqueo.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(arqueo);
		}
	});
};

/**
 * Delete an caja
 */
exports.delete = function(req, res) {
	var arqueo = req.arqueo ;
	arqueo.deleted = true;
	arqueo.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(arqueo);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Arqueo.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('puestos', 'name')
		.exec(function(err, arqueos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(arqueos);
			}
		});
	}
	else{
		Arqueo.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, arqueos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(arqueos);
			}
		});
	}
};

exports.loadmoreByCaja = function(req, res) {
	var enterprise = req.query.e || null;
    var limit = req.query.limit || null;
    var pagina = parseInt(req.query.p) || 0;
    var cajaId = req.query.caja || null;
        
	if (enterprise !== null) {
		Arqueo.find({enterprise: enterprise, caja: cajaId})
		.skip(pagina)
        .limit(limit)
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('puestos', 'name')
		.exec(function(err, arqueos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(arqueos);
			}
		});
	}
	else{
		Arqueo.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, arqueos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(arqueos);
			}
		});
	}
};

exports.loadmoreByCaja_Date = function(req, res) {
	var enterprise 	= req.query.e || null;
	var startdate	= req.query.start || null;
	var enddate 	= req.query.end || null;
    var cajaId 		= req.query.caja || null;
        
	if (enterprise !== null) {
		Arqueo.find({enterprise: enterprise, caja: cajaId, created: { $gte: startdate, $lte: enddate } })
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('puestos', 'name')
		.exec(function(err, arqueos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(arqueos);
			}
		});
	}
	else{
		Arqueo.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, arqueos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(arqueos);
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
exports.arqueoByID = function(req, res, next, id) {
	Arqueo.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('puestos', 'name')
	.exec(function(err, arqueo) {
		if (err) return next(err);
		if (! arqueo) return next(new Error('Failed to load arqueo ' + id));
		req.arqueo = arqueo ;
		next();
	});
};
