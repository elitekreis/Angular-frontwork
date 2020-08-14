'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),	//joker's add
	Pedido = mongoose.model('Pedido'),
	Compra = mongoose.model('Compra'),
	Venta = mongoose.model('Venta'),
	Provider = mongoose.model('Provider'),
	Product = mongoose.model('Product'),
	Cliente = mongoose.model('Cliente'),
	Comprobante = mongoose.model('Comprobante'),
	Finanza = mongoose.model('Finanza'),
	Movimiento = mongoose.model('Movimiento'),
	Caja = mongoose.model('Caja'),
	Condicionventa = mongoose.model('Condicionventa'),
	Moment = require('moment'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
	commonFunc = require(path.resolve(  './modules/core/common/common.server.function'));


//agrega productos asociados al proveedor
var agregarProductosAsociadosProveedor = function(idProd,idProv){
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
						console.log('error guardando prod asoc');
						return console.log(err);
					}
					else {
						return true;
					}
				});

			});
};

//agrega productos asociados al cliente
var agregarProductosAsociadosCliente = function(idProd,idCli){
	Cliente.findById(idCli)
			.exec(function(err, cliente) {
				if (err) return next(err);
				if (! cliente) return next(new Error('Failed to load Client ' + idCli));
				var repetido = false;
				for (var i = 0; i < cliente.productosAsociados.length; i++) {
					if (cliente.productosAsociados[i] == idCli){
						repetido = true;
					}
				};
				if (repetido == false){
					cliente.productosAsociados.push(idCli);
				}
				else{
					console.log('el producto ya se encuentra asociado al cliente');
				}
				cliente.save(function(err) {
					if (err) {
						return console.log(err);
					}
					else {
						return true;
					}
				});

			});
};

//Create un pedido
exports.create = function(req, res) {
	var d = new Moment();
	var pedido = new Pedido(req.body);
	pedido.user = req.user;
	pedido.created = new Date();
	var subt = 0;
	var desc = 0;
	var tax1Total = 0;
	var tax2Total = 0;
	var tax3Total = 0;
	var total = 0;
	pedido.filterDate = {
		year: d.year().toString(), 											// 2015
		quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', 	// 2015-1Q
		month: d.year().toString() + '-' + d.month().toString(), 			// 2015-7
		week: d.year().toString() + '-' + d.week().toString(), 				// 2015-29
		day: d.year().toString() + '-' + d.dayOfYear().toString(),			// 2015-191
		dayOfWeek: d.weekday(),												// 3 (Miercoles)
		Hour: d.hour() 														// 11
	};

	if(pedido.tipoPedido == 'compra'){
		var idProv = pedido.proveedor;
	}
	else{
		var idCli = pedido.cliente;
	}

	for (var i = 0; i < pedido.products.length; i++) {
		if(pedido.tipoPedido == 'compra'){
			desc = parseFloat(pedido.products[i].product.costPerUnit * pedido.products[i].descuento/100);
			subt = parseFloat(pedido.products[i].product.costPerUnit * pedido.products[i].cantidad - desc);
		}
		else{
			desc = parseFloat(pedido.products[i].product.price * pedido.products[i].descuento/100);
			subt = parseFloat(pedido.products[i].product.price * pedido.products[i].cantidad - desc);
		}
		total = total + subt;
		var iva = parseFloat(pedido.products[i].product.tax*subt/100);
		var idProd = pedido.products[i].product._id;
		var cant = pedido.products[i].cantidad;
		if (pedido.products[i].product.tax == 10.5){
			tax1Total = tax1Total + iva;
		}
		if (pedido.products[i].product.tax == 21){
			tax2Total = tax2Total + iva;
		}
		if (pedido.products[i].product.tax == 27){
			tax3Total = tax3Total + iva;
		}

		if(pedido.tipoPedido == 'compra'){
			agregarProductosAsociadosProveedor(idProd,idProv);
			var totalImp = pedido.totalImp;
		}
		else{
			var totalImp = 0;
		}


	};

	var descV = total * pedido.descuentoPorcentaje / 100;
	var neto = total - descV;
	var totalpedido = neto + tax1Total + tax2Total + tax3Total + totalImp;

	pedido.subtotal = total;
	pedido.descuentoValor = descV;
	pedido.neto = neto;
	pedido.tax1 = tax1Total;
	pedido.tax2 = tax2Total;
	pedido.tax3 = tax3Total;
	pedido.total = totalpedido;

	Pedido.count({enterprise: pedido.enterprise, tipoPedido: pedido.tipoPedido, numero: pedido.numero}, function (err, count) {
		if (err) {
			console.log(err, 'err');
		} else {
			if (count > 0) {
				pedido.numero = pedido.numero + count;
			}
		}
	});

	//*****Actualiza el ultimo numero del comprobante correspondiente
	comprobanteConId(pedido.tipoComprobante, function(comp){
			comp.ultimoNumero = pedido.numero;
			// console.log('pedido comprobante', pedido.numero);
			// console.log('comp ultimo num', comp.ultimoNumero);
			comp.save(function(err) {
				if (err) {
					console.log("comprobante guardado error");
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {

				};
			});
	});

	pedido.save(function(err) {
		if (err) {
			// console.log(JSON.stringify(pedido), 'pedido con eso raro');
			// console.log(pedido, 'pedido');
			// console.log(err, 'error');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(pedido);
		}
	});
};

/**
 * Show the current Pedido
 */
exports.read = function(req, res) {
	res.jsonp(req.pedido);
};

/**
 * Update a Pedido
 */
exports.update = function(req, res) {

	console.log('########################################################');
	console.log('########################################################');
	console.log('updating via api', req.body.estado, req.pedido);
	console.log('########################################################');
	console.log('########################################################');

	var pedido = req.pedido ;
	if (req.body.estado == 'aprobada'){
		/*console.log('entre aprobada');*/
		var d = new Moment();
		//transforma la orden en compra o venta si esta fue aprobada

		switch (pedido.tipoPedido) {
		case 'compra':
			if (pedido.category1 !== undefined){
				var categoria = pedido.category1._id;
			}
			else{
				var categoria = undefined;
			}
			var compra  = new Compra();
			compra.user = pedido.user;
			compra.created = pedido.created;
			compra.proveedor = pedido.proveedor._id;
			compra.puesto = pedido.puesto;
			compra.comprobante = pedido.numero;
			compra.tipoComprobante = pedido.tipoComprobante._id;
			compra.category = categoria;
			compra.estado = 'Pendiente de pago y recepcion';
			compra.products = pedido.products ;
			compra.observaciones = pedido.observaciones;
			compra.subtotal = pedido.subtotal;
			compra.descuentoPorcentaje = pedido.descuentoPorcentaje;
			compra.descuentoValor = pedido.descuentoValor;
			compra.neto = pedido.neto;
			compra.tax1 = pedido.tax1;
			compra.tax2 = pedido.tax2;
			compra.tax3 = pedido.tax3;
			compra.totalTax = pedido.totalTax;
			compra.total = pedido.total;
			compra.totalImp = pedido.totalImp;
			compra.condicionVenta = pedido.condicionVenta._id;
			compra.enterprise = pedido.enterprise._id;
			compra.filterDate = {
				year: d.year().toString(), 											// 2015
				quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', 	// 2015-1Q
				month: d.year().toString() + '-' + d.month().toString(), 			// 2015-7
				week: d.year().toString() + '-' + d.week().toString(), 				// 2015-29
				day: d.year().toString() + '-' + d.dayOfYear().toString(),			// 2015-191
				dayOfWeek: d.weekday(),												// 3 (Miercoles)
				Hour: d.hour() 														// 11
			};
			/*console.log(compra, 'compra');*/
			compra.save(function(err) {
				if (err) {
					console.log(err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					/*res.jsonp(compra);*/
					pedido = _.extend(pedido , req.body);
					pedido.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							console.log('compra ok');
							res.jsonp(pedido);
						}
					});

					/*for(var i=0; i<compra.products.length; i++){
						var actual = compra.products[i];
						productoConId(compra.products[i], function(c){
							var produccion = c.produccion;
							getStockByUserId(compra.user, c, function(err, idxStock){
								if (!err && idxStock!= null){
									var actualStock = c.stocks[idxStock].unitsInStock;
									var pedidos = actual.cantidad;
									c.stocks[idxStock].unitsInStock = parseInt(actualStock)+parseInt(pedidos);
									c.save(function(err) {
										if (err) {
											console.log('error actualizacion producto', err);
											// return res.status(400).send({
											// 	message: errorHandler.getErrorMessage(err)
											// });
										} else {
											console.log("stock producto actualizado");
										}
									});//end callback save
								}
							});
						});
					};// end for*/
				}
			});
		break;

		case 'venta':
			var venta  = new Venta();

			console.log(' up till working fine !!!!');

			venta.user = pedido.user;
			venta.cliente = pedido.cliente._id;
			venta.comprobante = pedido.numero;
			venta.created = pedido.created; // a pedido de justo que la venta por defeto tenga la fecha de creacion del pedido 2015.11.20
			venta.tipoComprobante = pedido.tipoComprobante ? pedido.tipoComprobante._id : undefined;
			venta.estado = 'Pendiente de pago y entrega' ;
			venta.products = pedido.products;
			venta.observaciones = pedido.observaciones;
			venta.subtotal = pedido.subtotal;
			venta.descuentoPorcentaje = pedido.descuentoPorcentaje;
			venta.descuentoValor = pedido.descuentoValor;
			venta.neto = pedido.neto;
			venta.tax1 = pedido.tax1;
			venta.tax2 = pedido.tax2;
			venta.tax3 = pedido.tax3;
			venta.totalTax = pedido.totalTax;
			venta.total = pedido.total;
			venta.condicionVenta = pedido.condicionVenta._id;
			venta.enterprise = pedido.enterprise._id;
			venta.filterDate = {
				year: d.year().toString(), 											// 2015
				quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', 	// 2015-1Q
				month: d.year().toString() + '-' + d.month().toString(), 			// 2015-7
				week: d.year().toString() + '-' + d.week().toString(), 				// 2015-29
				day: d.year().toString() + '-' + d.dayOfYear().toString(),			// 2015-191
				dayOfWeek: d.weekday(),												// 3 (Miercoles)
				Hour: d.hour() 														// 11
			};

			/*for(var i=0; i<venta.products.length; i++){
				var actual = venta.products[i];
				productoConId(actual, function(c){
					var produccion = c.produccion;
					var actualStock = c.unitsInStock;
					var pedidos = actual.cantidad;
					var nuevoStock = actualStock - pedidos;
					if( nuevoStock > 0){
						c.unitsInStock = nuevoStock;
					} else {
						c.unitsInStock = 0;
					}
					c.save(function(err) {
						if (err) {
							console.log('error actualizacion producto', err);
						} else {
							console.log("stock producto actualizado");
						}
					});//end callback save
					if ( produccion.length > 0){
						for(var i=0; i < produccion.length ; i++){
							var p = produccion[i];
							var produ = p.producto;
							materiaConId(produ, function(z){
								var cant = p.cantidad;
								var prod = p.producto;
								var totalCant = cant * pedidos;
								var stockA = z.unitsInStock;
								if (stockA - totalCant > 0){
									var num  = stockA - totalCant;
									z.unitsInStock = num.toFixed(2);
								}
								else{
									z.unitsInStock = 0;
								}
								z.save(function(err) {
									if (err) {
										console.log('error MP actualizacion');
									} else {
										console.log("stock MP actualizado");
									}
								});//end callback save
							})
						}
					}
				});
			};// end for*/

			venta.save(function(err) {
				if (err) {
					console.log(err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					console.log('------ok venta-------');
					// condicionConId(venta.condicionVenta, function(c){
					// 	if (c.name == 'Cuenta Corriente'){
					// 		crearMovimiento(venta);
					// 	}
					// 	else{
					// 		if (venta.caja !== undefined){
					// 			cajaConId(venta.caja, function(s){
					// 				agregarCaja(venta,c.name,s);
					// 			})
					// 		}
					// 	}
					// })

					pedido = _.extend(pedido , req.body);
					pedido.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							res.jsonp(pedido);

						}
					});
				}
			});
		break;
		}
	}
	else{
		pedido = _.extend(pedido , req.body);

		// pedido.cliente && pedido.cliente._id ? pedido.cliente = pedido.cliente._id : delete pedido.cliente;
		// pedido.condicionVenta && pedido.condicionVenta._id ? pedido.condicionVenta = pedido.condicionVenta._id : delete pedido.condicionVenta;
		// pedido.enterprise && pedido.enterprise._id ? pedido.enterprise = pedido.enterprise._id : delete pedido.enterprise;
		//
		// console.log('saved data!!', pedido)

		pedido.save(function(err) {
			if (err) {
				console.log(err, 'errorrrr');
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(pedido);
			}
		});
	}
};

//crea un nuevo movimiento para las finanzas cuando se crea una venta
function crearMovimiento (venta) {

	var idClient = venta.cliente;

	var f = new Movimiento();
	f.client = venta.cliente;
	f.caja = venta.caja;
	f.condicion = venta.condicionVenta;
	f.comprobante = venta.tipoComprobante;
	f.numero = venta.comprobante;
	f.fecha = venta.created;
	f.estado = 'haber';
	f.monto = venta.total;
	f.saldo = venta.total;
	f.enterprise = venta.enterprise;
	f.deleted = false;
	f.created = Date.now();
	f.user = venta.user;

	clientConId(idClient, function(c){
		var idFinanza = c.finanza;
		finanzaConId(idFinanza, function(z){
			z.saldo = z.saldo + venta.total;
			z.update = Date.now();
			z.save(function(err) {
				if (err) {
					console.log("fianza actualizada error");
				} else {
					console.log("fianza actualizada ok");
					f.saldo = z.saldo;
					f.finanza = idFinanza;
					f.save(function(err) {
						if (err) {
							console.log(err);
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							console.log('todo piola');
						}
					});
				}
			});//end callback save
		})
	});
};

function agregarCaja(venta,condicion,c){
	if (condicion == 'Cheque'){
		c.cheques = c.cheques + venta.total;
	}
	else{
		if (condicion == 'Efectivo'){
			c.efectivo = c.efectivo + venta.total;
		}
		else{
			if(condicion == 'Tarjeta de Credito'){
				c.credito = c.credito + venta.total;
			}
			else{
				if (condicion == 'Tarjeta de Debito'){
					c.debito = c.debito + venta.total;
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
};


/**
 * Delete an Pedido
 */
exports.delete = function(req, res) {
	var pedido = req.pedido ;
	pedido.deleted = true;

	pedido.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(pedido);
		}
	});
};

/**
 * List of Pedidos
 */
exports.list = function(req, res) {
	// Inicio de càlculo de semana actual //
	var week = req.query.w || null;
	var Year = req.query.y || null;
	var tipoPedido = req.query.tipoPedido || null;
	var estado = req.query.estado || null;
	var pagina = parseInt(req.query.p) || null;
	var limite = parseInt(req.query.pcount) || null;
	/*if (week === null) {
		var today = new Date();
		var first = new Date(today.getFullYear(), 0, 1);
		var theDay = Math.round(((today - first) / 1000 / 60 / 60 / 24) + .5, 0);
		var year = today.getFullYear();
		// calculo semana start
		var target  = today;
		var dayNr   = (today.getDay() + 6) % 7;
		target.setDate(target.getDate() - dayNr + 3);
		var jan4    = new Date(target.getFullYear(), 0, 4);
		var dayDiff = (target - jan4) / 86400000;
		var weekNr = 1 + Math.ceil(dayDiff / 7);
	} else {
		var weekNr = week;
		var year = parseInt(Year);
	}; */
	// fin de càlculo de semana actual //
	var start = new Date;
	var enterprise = req.query.e || null;
	//var tipo = req.query.t || null;
	if (enterprise !== null) {
		//Pedido.find({enterprise: enterprise, 'filterDate.week': year + '-' + weekNr})
		Pedido.find({enterprise: enterprise, tipoPedido: tipoPedido, estado: estado})
		.skip(pagina * limite)
		.limit(limite)
		.sort('-created')
		//.limit(100)
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		// .populate('tipoComprobante', 'name')
		.populate('condicionVenta', 'name')
		.populate('proveedor', 'name address phone')
		.populate('cliente', 'name address phone')
		.populate('category1', 'name')
		.exec(function(err, pedidos) {
			if (err) {
				console.log(err, 'err');
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var end = new Date();
				res.jsonp(pedidos);
			}
		});
	} else{
		Pedido.find({'filterDate.week': year + '-' + weekNr})
		.sort('-created')
		.limit(100)
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('tipoComprobante', 'name')
		.populate('condicionVenta', 'name')
		.populate('proveedor', 'name address phone')
		.populate('cliente', 'name address phone')
		.populate('category1', 'name')
		.exec(function(err, pedidos) {
			if (err) {
				console.log(err, 'err');
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var end = new Date();
				// console.log('[+] pedidos::list finalizado en: %sms', end - start);
				res.jsonp(pedidos);
			}
		});
	}
};

exports.loadMore = function(req, res) {
    var last = req.query.last || null;
    var enterprise = req.query.e || null;
    var estado = req.query.estado || null;
    var tipoPedido = req.query.type || null;
    var limit = req.query.limit || null;

    console.log(last+ " "+estado + " "+limit);
    if (last) {
        Pedido.find({enterprise: enterprise, tipoPedido: tipoPedido, estado: estado, created: { $lt: last}})
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function(err, pedidos) {
                if (err) {
                    console.log(err, 'err');
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pedidos);
                }
            });
    } else{
        Pedido.find({enterprise: enterprise, tipoPedido: tipoPedido, estado: estado})
            .limit(limit)
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function(err, pedidos) {
                if (err) {
                    console.log(err, 'err');
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pedidos);
                }
            });
    }
};

exports.select = function(req, res) {
    var tipoPedido = req.query.tipoPedido || null;
    var estado = req.query.estado || null;
    var enterprise = req.query.e || null;

    if (enterprise !== null) {
        Pedido.find({enterprise: enterprise, tipoPedido: tipoPedido, estado: estado})
            .limit(10)
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function(err, pedidos) {
                if (err) {
                    console.log(err, 'err');
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(pedidos);
                }
            });
    } else{
        return res.status(400).send({message: 'something went wrong'});
    }
};

exports.search = function(req, res) {
    var tipoPedido = req.query.tipoPedido || null;
    var estado = req.query.estado || null;
    var enterprise = req.query.e || null;
    var searchString = new RegExp(req.query.search , 'i') || null;
    if (enterprise !== null) {
        Pedido.find({enterprise: enterprise, tipoPedido: tipoPedido, estado: estado})
            .limit(10)
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('condicionVenta', 'name')
            .populate('proveedor', 'name address phone')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function(err, pedidos) {
                if (err) {
                    console.log(err, 'err');
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                	var pedidosResult = [];
                	pedidos.forEach(function(pedido){
                		if(searchString.test(pedido.user.displayName) || searchString.test(pedido.proveedor.name) || searchString.test(pedido.comprobante)){
                			pedidosResult.push(pedido);
                		}
                	})
                    res.jsonp(pedidosResult);
                }
            });
    } else{
        return res.status(400).send({message: 'something went wrong'});
    }
};

//retorna un producto con id
function productoConId(p, callback){
	Product.findById(p.product._id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.exec(function(err, product) {
		if (!err) {
			return callback(product);
		} else {
			console.log("error");
		}
	});
};

function materiaConId(p, callback){
	Product.findById(p)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.exec(function(err, product) {
		if (!err) {
			return callback(product);
		} else {
			console.log("error");
		}
	});
};

function condicionConId(c, callback){
	Condicionventa.findById(c)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, condicion) {
		if (!err) {
			return callback(condicion);
		} else {
			console.log("error");
		}
	});
};

/**
 * Pedido middleware
 */
exports.pedidoByID = function(req, res, next, id) {
	Pedido.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('tipoComprobante', 'name')
	.populate('condicionVenta', 'name')
	.populate('proveedor', 'name address phone')
	.populate('cliente', 'name address phone')
	.populate('category1', 'name')
	// .populate('caja', 'name')
	.exec(function(err, pedido) {
		if (err) return next(err);
		if (! pedido) return next(new Error('Failed to load Pedido ' + id));
		req.pedido = pedido ;
		next();
	});
};

function finanzaConId(z, callback){
	Finanza.findById(z)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, finanza) {
		if (!err) {
			return callback(finanza);
		} else {
			console.log("error");
		}
	});
};

function cajaConId(c, callback){
	Caja.findById(c)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, caja) {
		if (!err) {
			return callback(caja);
		} else {
			console.log("error caja con id");
		}
	});
};

function clientConId(c, callback){
	Cliente.findById(c)
	// .populate('user', 'displayName')
	// .populate('enterprise', 'name')
	.exec(function(err, client) {
		if (!err) {
			return callback(client);
		} else {
			console.log("error");
		}
	});
};


//retorna un comprobante con id
function comprobanteConId(id, callback){
	Comprobante.findById(id)
	.exec(function(err, comp) {
		if (!err) {
			return callback(comp);
		} else {
			console.log("error");
		}
	});
};
