'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Compra = mongoose.model('Compra'),
	HistorialCompra = mongoose.model('HistorialCompras'),
	Provider = mongoose.model('Provider'),
	Product = mongoose.model('Product'),
	Finanza = mongoose.model('Finanza'),
	Movimiento = mongoose.model('Movimiento'),
	Caja = mongoose.model('Caja'),
	Condicionventa = mongoose.model('Condicionventa'),
	Moment = require('moment'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	commonFunc = require(path.resolve(  './modules/core/common/common.server.function'));


//actualiza el stock de los productos de la compra
var actualizarStock = function(id,cant,previousCant,user){
		Product.findById(id)
			.exec(function(err, product) {
				if (err) return next(err);
				if (! product) return next(new Error('Failed to load Product ' + id));
				commonFunc.getStockByUserId(user, product, function(err, idxStock){
					if (err)
						return res.status(200).send({ message: "can't search userstock" });

					if(idxStock!= null){
						var lastStockValue 	= product.stocks[idxStock].unitsInStock;
						var newValue = cant - previousCant + lastStockValue;
						product.stocks[idxStock].unitsInStock = newValue;
						product.save(function(err) {
							if (err) {
								return console.log(err);
							}
							else {
								return true;
							}
						});
					}
				});

			});
};

var agregarProductosAsociados = function(idProd,idProv){
	Provider.findById(idProv)
			.exec(function(err, provider) {
				if (err) return next(err);
				if (! provider) return next(new Error('Failed to load Provider ' + idProv));
				var repetido = false;
				for (var i = 0; i < provider.productosAsociados.length; i++) {
					if (provider.productosAsociados[i] == idProd){
						repetido = true;
					}
				};
				if (repetido == false){
					provider.productosAsociados.push(idProd);
				}
				else{
					console.log('el producto ya se encuentra asociado al proveedor');
				}

				provider.save(function(err) {
					if (err) {
						return console.log(err);
					}
					else {
						return true;
					}
				});

			});
};

exports.create = function(req, res) {
	var compra = new Compra(req.body);
	compra.user = req.user;
	var subt = 0;
	var desc = 0;
	var tax1Total = 0;
	var tax2Total = 0;
	var tax3Total = 0;
	var total = 0;
	if (compra.fechaAlta !== undefined) {
		var d = new Moment(compra.fechaAlta);
	} else {
		var d = new Moment(compra.created);
	}
	compra.filterDate = {
		year: d.year().toString(), 											// 2015
		quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', 	// 2015-1Q
		month: d.year().toString() + '-' + d.month().toString(), 			// 2015-7
		week: d.year().toString() + '-' + d.week().toString(), 				// 2015-29
		day: d.year().toString() + '-' + d.dayOfYear().toString(),			// 2015-191
		dayOfWeek: d.weekday(),												// 3 (Miercoles)
		Hour: d.hour() 														// 11
	};

	var idProv = compra.proveedor;

	for (var i = 0; i < compra.products.length; i++) {
		desc = compra.products[i].product.costPerUnit * compra.products[i].descuento/100;
		subt = ((compra.products[i].product.costPerUnit * compra.products[i].cantidad) - (desc * compra.products[i].cantidad));
		total = total + subt;
		var iva = parseFloat(compra.products[i].product.tax*subt/100);
		var idProd = compra.products[i].product._id;
		var cant = compra.products[i].cantidad;
		if (compra.products[i].product.tax == 10.5){
			tax1Total = tax1Total + iva;
		}
		if (compra.products[i].product.tax == 21){
			tax2Total = tax2Total + iva;
		}
		if (compra.products[i].product.tax == 27){
			tax3Total = tax3Total + iva;
		}
		actualizarStock(idProd,cant,0,compra.user);
		agregarProductosAsociados(idProd,idProv);
	};

	var descV = total * compra.descuentoPorcentaje / 100;
	var neto = total - descV;
	var totalImp = compra.totalImp;
	var totalCompra = neto + tax1Total + tax2Total + tax3Total + totalImp;

	compra.subtotal = total;
	compra.descuentoValor = descV;
	compra.neto = neto;
	compra.tax1 = tax1Total;
	compra.tax2 = tax2Total;
	compra.tax3 = tax3Total;
	compra.total = totalCompra;
	compra.fechaRecepcion = Date.now();

	var idCondicion = compra.condicionVenta;

	if (compra.estado == 'Finalizada'){
		condicionConId(idCondicion, function(err, c){
			if (c.name == 'Cuenta Corriente'){
				if(err == null) {
					crearMovimiento(compra, function(err, data){
						if (err == null){
							return res.jsonp(data);
						} else {
							console.log("[E] Error devuelto por el callback: ", err);
							return res.status(400).send({
								status: 'error',
								message: err
							})
						}
					})
				}
				else{
					return callback(err);
				}
			}
			else{
				if(err == null) {
					agregarCaja(compra, c.name, function(err, data) {
						if(err == null) {
							return res.jsonp(data);
						} else {
							console.log("[E] Error devuelto por el callback: ", err);
							return res.status(400).send({
								status: 'error',
								message: err
							})
						}
					});
				}
				else{
					return callback(err);
				}
			}
		})
	}
	else{
		compra.save(function(err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(compra);
			}
		});
	}
};

exports.read = function(req, res) {
	res.jsonp(req.compra);
};

exports.update = function(req, res) {
	var compra = req.compra;
	compra = _.extend(compra , req.body);

	var idCondicion = req.body.condicionVenta;
	if(compra.historial != undefined && compra.historial._id != undefined) {
		compra.historial = compra.historial._id.toString();
	}

	if (compra.estado == 'Finalizada'){
		condicionConId(idCondicion, function(err, c){
			if (c.name == 'Cuenta Corriente'){
				if(err == null) {
					crearMovimiento(compra, function(err, data){
						if (err == null){
							return res.jsonp(data);
						} else {
							console.log("[E] Error devuelto por el callback: ", err);
							return res.status(400).send({
								status: 'error',
								message: err
							})
						}
					})
				}
				else{
					return callback(err);
				}
			}
			else{
				if(err == null) {
					agregarCaja(compra, c.name, function(err, data) {
						if(err == null) {
							return res.jsonp(data);
						} else {
							console.log("[E] Error devuelto por el callback: ", err);
							return res.status(400).send({
								status: 'error',
								message: err
							})
						}
					});
				}
				else{
					return callback(err);
				}
			}
		})
	}
	else{
		if(compra.estado == 'Pendiente de recepcion' || compra.estado == 'Pendiente de pago2'){
			if(compra.historial != undefined && compra.historial != null){
				HistorialCompra.findById(compra.historial)
					.exec(function(err, hCompra){
						if(!err && hCompra) {
							for (var i = 0; i < compra.products.length; i++) {
								var idProd = compra.products[i].product._id;
								var cant = compra.products[i].cantidad;
								var previousCant = getPreviousCant(hCompra, idProd);
								actualizarStock(idProd,cant,previousCant,compra.user);
							};
						}
					});
			}
			
		}else if(compra.estado == 'Anulada'){
			if(compra.prevEstado == 'Pendiente de recepcion' || compra.prevEstado == 'Finalizada'){
				for (var i = 0; i < compra.products.length; i++) {
					var idProd = compra.products[i].product._id;
					var cant = compra.products[i].cantidad;
					actualizarStock(idProd,-cant,0,compra.user);
				};
			}
		}
		compra.save(function(err) {
			if (err) {
				console.log(err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(compra);
			}
		});
	}	
};

//joker's add
function getPreviousCant (historialCompra, idProd){
	if(historialCompra != null){
		var products = historialCompra.compra.products;
		for(var i=0; i<products.length; i++){
			if(products[i].product.id == idProd){
				return products[i].cantidad;
			}
		}
	}
	return 0;
}

function crearMovimiento (compra, callback){

	var idProvider = compra.proveedor;

	var f = new Movimiento();
		f.provider = compra.proveedor;
		f.comprobante = compra.tipoComprobante;
		f.caja = compra.caja;
		f.condicion = compra.condicionVenta;
		f.numero = compra.comprobante;
		f.fecha = compra.fechaRecepcion;
		f.estado = 'debe';
		f.monto = compra.total;
		f.saldo = compra.total;
		f.enterprise = compra.enterprise;
		f.deleted = false;
		f.created = Date.now();
		f.user = compra.user;

	providerConId(idProvider, function(err, p){
		if(err == null) {
			var idFinanza = p.finanza;
			finanzaConId(idFinanza, function(err, z){
				if(err == null) {
					z.saldo = z.saldo + compra.total;
					z.update = Date.now();
					z.save(function(err) {
						if (err) {
							return callback(err);
						} else {
							console.log("fianza actualizada ok");
							f.saldo = z.saldo;
							f.finanza = idFinanza;
							f.save(function(err) {
								if (err) {
									return callback(err);
								} else {
									console.log('todo piola');
									compra.save(function(err) {
										if (err) {
											return callback(err);
										} else {
											return callback(null, compra);
										}
									});
								}
							});
						}
					});//end callback save
				}
				else{
					return callback(err)
				}	
			})
		}
		else{
			return callback(err)
		}	
	});	
}

function agregarCaja(compra,condicion, callback){
	var idCaja = compra.caja;
	cajaConId(idCaja, function(err, c){
		if(err == null) {
			if (condicion == 'Cheque'){
				c.cheques = c.cheques - compra.total;
			}
			else{
				if (condicion == 'Efectivo'){
					c.efectivo = c.efectivo - compra.total;		
				}
				else{
					if(condicion == 'Tarjeta de Credito'){
						c.credito = c.credito - compra.total;			
					}
					else{
						if (condicion == 'Tarjeta de Debito'){
							c.debito = c.debito - compra.total;
						}
					}
				}
			}
			c.total = c.cheques + c.efectivo + c.debito + c.debito;
			compra.saldoCaja = c.total;
			compra.save(function(err) {
				if (err) {
					return callback(err);
				} else {
					c.save(function(err) {
						if (err) {
							return callback(err);
						} else {
							return callback(null, c);
						}
					});
				}
			});	
		} else {
			return callback(err)
		};	
	})		
};

exports.delete = function(req, res) {
	var compra = req.compra ;
	compra.deleted = true;

	for (var i = 0; i < compra.products.length; i++) {
		var idProd = compra.products[i].product._id;
		var cant = compra.products[i].cantidad;
		actualizarStock(idProd,-cant,0,compra.user);
	};

	compra.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(compra);
		}
	});
};

exports.list = function(req, res) {
	// Inicio de càlculo de semana actual //
	var week = req.query.w || null;
	var Year = req.query.y || null;
	var estado = req.query.estado || null;
	var pagina = parseInt(req.query.p) || null;
	var limite = parseInt(req.query.pcount) || null;

	// if (week === null) {
	// 	var today = new Date();
	// 	var first = new Date(today.getFullYear(), 0, 1);
	// 	var theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
	// 	var year = today.getFullYear();
	// 	// calculo semana start
	// 	var target  = today;
	// 	var dayNr   = (today.getDay() + 6) % 7;
	// 	target.setDate(target.getDate() - dayNr + 3);
	// 	var jan4    = new Date(target.getFullYear(), 0, 4);
	// 	var dayDiff = (target - jan4) / 86400000;
	// 	var weekNr = 1 + Math.ceil(dayDiff / 7);
	// } else {
	// 	var weekNr = week;
	// 	var year = parseInt(Year);
	// };

	var start = new Date;
	var enterprise = req.query.e || null;

	//para que devuelva todos (para calcular deuda proveedor por ejemplo)
		// fin de càlculo de semana actual //
	if (enterprise !== null) {
		Compra.find({enterprise: enterprise, estado: estado})
		.skip(pagina * limite)
		.limit(limite)
		// .limit(25)
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('tipoComprobante', 'name')
		.populate('condicionVenta', 'name')
		.populate('proveedor', 'name address phone')
		.populate('product', 'name')
		.exec(function(err, compras) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var end = new Date();
				// console.log('[+] compras::list finalizado en: %sms', end - start);
				res.jsonp(compras);
			}
		});
	} else {
		Compra.find({'filterDate.week': year + '-' + weekNr})
		.sort('-created')
		.limit(100)
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('tipoComprobante', 'name')
		.populate('condicionVenta', 'name')
		.populate('proveedor', 'name address phone')
		.populate('product', 'name')
		.exec(function(err, compras) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var end = new Date();
				// console.log('[+] compras::list finalizado en: %sms', end - start);
				res.jsonp(compras);
			}
		});
	};
};

exports.comprasResumen = function (req, res) {
	
    var year = req.body.year;
    var month = req.body.month;
    var enterprise = req.body.enterprise;
    var centroDeCosto = req.body.centroDeCosto;
    var startDate = Moment().startOf('month');
    var endDate = startDate.clone().endOf('month');

    if (month && year) {
        startDate = Moment().year(year).month(month).startOf("month");
        endDate = startDate.clone().endOf('month');
    } else if (month) {
        startDate = Moment().month(month).startOf("month");
        endDate = startDate.clone().endOf('month');
    } else if (year) {
        startDate = Moment().year(year).startOf("year");
        endDate = startDate.clone().endOf('year');
    }

    var returnCompras = [];
    
    Compra
        .find({
            enterprise: enterprise,
            deleted: false,
            fechaRecepcion: {
                $gt: startDate.format(),
                $lt: endDate.format()
            },
            estado: 'Finalizada'
        })
        .populate('puesto')
        .exec(function (err, compras) {
        	
            if (err) {
                return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {
                compras.forEach(function(compra) {
                    if(compra.puesto && compra.puesto.centroDeCosto === centroDeCosto && compra.puesto.deleted === false) {
                        returnCompras.push(compra);
                    }
                });

                res.jsonp(returnCompras);
            }
        });
};

exports.loadMore = function(req, res) {
    var last = req.query.last || null;
    var enterprise = req.query.e || null;
    var estado = req.query.estado || null;
    var limit = req.query.limit || null;

    if (last) {
        Compra.find({enterprise: enterprise, estado: estado, created: { $lt: last}})
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('tipoComprobante', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('product', 'name')
            .exec(function(err, compras) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(compras);
                }
            });
    } else {
        Compra.find({enterprise: enterprise, estado: estado})
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('tipoComprobante', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('product', 'name')
            .exec(function(err, compras) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(compras);
                }
            });
    }
};

exports.loadMoreByCaja = function(req, res) {
    var last = req.query.last || null;
    var enterprise = req.query.e || null;
    var estado = req.query.estado || null;
	var limit = req.query.limit || null;
	var pagina = parseInt(req.query.p) || 0;
	var caja = req.query.caja || null;

    if (last) {
		Compra.find({enterprise: enterprise, estado: estado, caja: caja,  created: { $lt: last}})
			.skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('tipoComprobante', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('product', 'name')
            .exec(function(err, compras) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(compras);
                }
            });
    } else {
		Compra.find({enterprise: enterprise, estado: estado, caja: caja})
			.skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('tipoComprobante', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('product', 'name')
            .exec(function(err, compras) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(compras);
                }
            });
    }
};

exports.loadMoreByCajaDate = function(req, res) {

    var enterprise 	= req.query.e || null;
    var estado 		= req.query.estado || null;
	var startdate	= req.query.start || null;
	var enddate 	= req.query.end || null;

	var caja = req.query.caja || null;
    
	Compra.find({enterprise: enterprise, estado: estado, caja: caja,  created: { $gte: startdate, $lte: enddate } })		
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('tipoComprobante', 'name')
		.populate('condicionVenta', 'name')
		.populate('proveedor', 'name address phone')
		.populate('product', 'name')
		.exec(function(err, compras) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(compras);
			}
		});
    
};

exports.loadMoreImpuestos = function (req, res) {
    var impuesto = req.query.impuesto || null;
    var last = req.query.last || null;
    var limit = req.query.limit || null;
    var year = req.query.year;
    var month = req.query.month;

    var startDate = Moment().startOf('month');
    var endDate = startDate.clone().endOf('month');

    if (month && year) {
        startDate = Moment().year(year).month(month).startOf("month");
        endDate = startDate.clone().endOf('month');
    } else if (month) {
        startDate = Moment().month(month).startOf("month");
        endDate = startDate.clone().endOf('month');
    } else if (year) {
        startDate = Moment().year(year).startOf("year");
        endDate = startDate.clone().endOf('year');
    }

    if(Moment(last) > endDate) {
        last = endDate.clone();
    }

    if (last) {
        Compra.find({impuestoId: impuesto, deleted: false, created: {$gt: startDate.format(), $lt: Moment(last).format()}, totalTax: {$gt: 0}})
            .limit(limit)
            .sort('-created')
            .populate('proveedor', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                res.jsonp(ventas);
            })
    } else {
        Compra.find({impuestoId: impuesto, deleted: false, created: {$gt: startDate.format(), $lt: endDate.format()}, totalTax: {$gt: 0}})
            .limit(limit)
            .sort('-created')
            .populate('proveedor', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                res.jsonp(ventas);
            })
    }
};

exports.select = function(req, res) {
    var estado = req.query.estado || null;
    var enterprise = req.query.e || null;

    if (enterprise !== null) {
        Compra.find({enterprise: enterprise, estado: estado})
            .limit(10)
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('tipoComprobante', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('product', 'name')
            .exec(function(err, compras) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(compras);
                }
            });
    } else {
        return res.status(400).send({message: 'something went wrong'});
    }
};

exports.searchCompras = function(req, res) {
    var estado = req.query.estado || null;
    var enterprise = req.query.e || null;
    var searchString = new RegExp(req.query.search , 'i') || null;
    if (enterprise !== null) {
        Compra.find({enterprise: enterprise, estado: estado})
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('tipoComprobante', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('product', 'name')
	        .exec(function(err, compras) {
	                if (err) {
	                    return res.status(400).send({
	                        message: errorHandler.getErrorMessage(err)
	                    });
	                } else {
	                	var comprasResult = [];
		                	compras.forEach(function(compra){
		                		if(searchString.test(compra.user.displayName) || searchString.test(compra.proveedor.name) || searchString.test(compra.comprobante)){
		                			comprasResult.push(compra);
		                		}
		                	})
	                    res.jsonp(comprasResult);
	                }
	            });
    } else {
        return res.status(400).send({message: 'something went wrong'});
    }
};

function condicionConId(c, callback){
	Condicionventa.findById(c)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, condicion) {
		if (!err) {
			return callback(null, condicion);
		} else {
			return callback(err)
		}
	});
};

function finanzaConId(id, callback){
	Finanza.findById(id)
	.exec(function(err, finanza) {
		if (!err) {
			return callback(null, finanza);
		} else {
			return callback(err)
		}
	});
};

function cajaConId(c, callback){
	Caja.findById(c)
	.exec(function(err, caja) {
		if (!err) {
			return callback(null, caja);
		} else {
			return callback(err)
		}
	});
};

function providerConId(p, callback){
	Provider.findById(p)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, product) {
		if (!err) {
			return callback(null, product);
		} else {
			return callback(err)
		}
	});
};

exports.compraByID = function(req, res, next, id) {
	 Compra.findById(id)
	 .populate('user', 'displayName')
	 .populate('enterprise', 'name')
	 .populate('tipoComprobante', 'name')
	 .populate('condicionVenta', 'name')
	 .populate('proveedor', 'name address phone impuesto1 impuesto2 impuesto3 impuesto4')
	 .populate('product', 'name')
	 .populate('category', 'name')
	 .populate('caja', 'name')
	 .populate('historial')
	 .exec(function(err, compra) {
		if (err) return next(err);
		if (! compra) return next(new Error('Failed to load Compra ' + id));
		req.compra = compra ;
		next();
	});
};
