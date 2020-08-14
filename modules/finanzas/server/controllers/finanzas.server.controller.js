'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Finanza = mongoose.model('Finanza'),
	Factura = mongoose.model('Facturado'),
	Servicio = mongoose.model('Servicio'),
 	Pago = mongoose.model('Pago'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var finanza = new Finanza(req.body);
	finanza.user = req.user;

	finanza.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(finanza);
		}
	});
};

/**
 * Show the current finanza
 */
exports.read = function(req, res) {
	res.jsonp(req.finanza);
};

/**
 * Update a finanza
 */
exports.update = function(req, res) {
	var finanza = req.finanza ;

	finanza = _.extend(finanza , req.body);

	finanza.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(finanza);
		}
	});
};

/**
 * Delete an Comprobante
 */
exports.delete = function(req, res) {
	var finanza = req.finanza ;
	finanza.deleted = true;
	finanza.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(finanza);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	
	var enterprise = req.query.e || null;
	var limit = req.query.limit ? parseInt(req.query.limit) : null;
	var last = req.query.last ? req.query.last : null;

	try {
		last = JSON.parse(last);
	} catch (e) {
		return res.status(400).send({message: "couldn't parse JSON"});
	}

	
	//use for view in cuenta de pagar / costosindirectos
	if(req.query.type === "facturas") {
		var resultList = [];
		Servicio.find({enterprise: req.query.enterprise},function(err,service){
			if(err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				for(var i = 0; i < service.length; i++ ) {
					resultList.push({
						name: service[i].name,
						_id: service[i]._id,
						saldo: (service[i].operacion.length > 0) ? service[i].operacion[service[i].operacion.length - 1].saldo : 0,
						operacion: service[i].operacion
					});
				}

				res.jsonp(resultList);
				/*var item = {};
				var filteElem;
				for(var i = 0; i < service.length; i++ ) {
					if(!item[service[i].name]) {
						//if(service[i].operacion.length > 0)						
						resultList.push({
							name: service[i].name,
							_id: service[i]._id,
							saldo: (service[i].operacion.length > 0) ? service[i].operacion[service[i].operacion.length - 1].saldo : 0,
							operacion: service[i].operacion
						});
						item[service[i].name] = service[i].operacion;					
					} else {
						if(service[i].operacion.length > 0 && item[service[i].name].length > 0) {
							var a = service[i].operacion[service[i].operacion.length-1].date;
							var b = item[service[i].name][item[service[i].name].length - 1].date;
							var latestUpdate = (+ b) > (+ a);
							if(!latestUpdate) {
								for(var k = 0; k < resultList.length; k++) {
									if(resultList[k].name === service[i].name) {
										resultList[k].operacion[resultList[k].operacion.length - 1].saldo += service[i].operacion[service[i].operacion.length-1].saldo;
										resultList[k].operacion[resultList[k].operacion.length - 1].date = service[i].operacion[service[i].operacion.length-1].date
									}
								}
							}
						} 
					}
				}*/
				
			}
		})
		return;
	}


	if (enterprise !== null) {
		
		if (last) {
			Finanza.find({enterprise: enterprise, saldo: { $lte: last.saldo,  $ne: 0 }, created: { $ne: last.created}, tipoFinanza: req.query.type, deleted: false})
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					console.log('error occured', err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		} else {
			Finanza.find({enterprise: enterprise, tipoFinanza: req.query.type, saldo: { $ne: 0 }, deleted: false})
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		}
	}
	else{
		if (last) {
			Finanza.find({ saldo: { $lte: last.saldo,  $ne: 0 }, created: { $ne: last.created}, tipoFinanza: req.query.type, deleted: false })
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		} else {
			Finanza.find({tipoFinanza: req.query.type, deleted: false, saldo: { $ne: 0 } })
			.sort('-saldo')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.populate('provider', 'name')
			.populate('comprobante', 'name')
			.populate('client', 'name')
			.limit(limit)
			.exec(function(err, finanzas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(finanzas);
				}
			});
		}
	}
};

/**
 * Comprobante middleware
 */
exports.finanzaByID = function(req, res, next, id) {
	Finanza.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('provider', 'name')
	.populate('comprobante', 'name')
	.populate('client', 'name')
	.exec(function(err, finanza) {
		if (err) return next(err);
		if (! finanza) return next(new Error('Failed to load finanza ' + id));
		req.finanza = finanza ;
		next();
	});
};
