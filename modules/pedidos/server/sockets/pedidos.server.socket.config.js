'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Cliente = mongoose.model('Cliente'),
    Product = mongoose.model('Product'),
    Finanza = mongoose.model('Finanza'),
    Movimiento = mongoose.model('Movimiento'),
    Caja = mongoose.model('Caja'),
    Condicionventa = mongoose.model('Condicionventa'),
    Venta = mongoose.model('Venta'),
    Pedido = mongoose.model('Pedido'),
    Moment = require('moment');

module.exports = function(io, socket) {

    //get enterprises and create socket namespaces
    getEnterprises(function(result) {
        if (result.status !== 'success') {
            console.log('Error al recibir listado de empresas para el socket: ', result.message);
        } else {
            //console.log('data: ', JSON.stringify(result.data));
            if (result.data.length > 0) {
                var enterprises = result.data;
                var namespaces = {};

                enterprises.forEach(function(enterprise) {
                    namespaces[enterprise.name] = io.of('/' + enterprise.name);
                });

                //console.log('namespace:', namespaces);
            } else {
                console.log('Error, no se han creado empresas?');
            }
        }
    });

    // get list of posts for enterpise when message is received
    socket.on('pedido.update', function(message) {
        console.log("[+] evento de actualizacion de pedido disparado!", message._id);
        updatePedido(message, function(result) {
            if (result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('pedido.update', result.data);
            }
        });
    });

    function updatePedido(message, callback) {
        Pedido.findById(message._id)
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('proveedor', 'name address phone')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function(err, item) {
                if (!err) {

                    var pedido = item;
                    var uid = pedido.user;
                    var d = new Moment();

                    message.user = uid;

                    pedido = _.extend(pedido, message);

                    //console.log('[I] Pedido: ', pedido);

                    var venta = new Venta();
                    venta.user = pedido.user;

                    pedido.cliente && pedido.cliente._id ? venta.cliente = pedido.cliente._id : venta.cliente = pedido.cliente;

                    venta.caja = pedido.caja;
                    venta.comprobante = pedido.numero;
                    venta.created = pedido.created; // a pedido de justo que la venta por defeto tenga la fecha de creacion del pedido 2015.11.20
                    venta.tipoComprobante = pedido.tipoComprobante;
                    venta.puesto = pedido.puesto;
                    venta.estado = 'Pendiente de pago y entrega';
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
                    venta.condicionVenta = pedido.condicionVenta;
                    venta.myDate = pedido.myDate;
                    venta.myDateChanged = pedido.myDateChanged;
                    venta.impuesto = pedido.impuesto;
                    pedido.enterprise && pedido.enterprise._id ? venta.enterprise = pedido.enterprise._id : venta.enterprise = pedido.enterprise;

                    venta.filterDate = {
                        year: d.year().toString(), // 2015
                        quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', // 2015-1Q
                        month: d.year().toString() + '-' + d.month().toString(), // 2015-7
                        week: d.year().toString() + '-' + d.week().toString(), // 2015-29
                        day: d.year().toString() + '-' + d.dayOfYear().toString(), // 2015-191
                        dayOfWeek: d.weekday(), // 3 (Miercoles)
                        Hour: d.hour() // 11
                    };

                    for (var i = 0; i < venta.products.length; i++) {
                        var actual = venta.products[i];
                        productoConId(actual.product._id, i, function(err, c, count) {
                            if (err !== null) {
                                console.log('[E] productoConId::error: ', err);
                                return callback({ status: 'error', message: err });
                            } else {
                                //console.log('[I] productoConId::c :', c);
                                var produccion = c.produccion ? c.produccion : [];
                                var actualStock = c.unitsInStock;
                                var pedidos = actual.cantidad;
                                var nuevoStock = actualStock - pedidos;
                                if (produccion.length > 0) {
                                    for (var e = 0; e < produccion.length; e++) {
                                        var p = produccion[e];
                                        //console.log('[I] productoConId::p :', p);
                                        var produ = p;
                                        //console.log('[I] variable produ: ', produ);
                                        materiaConId(produ, e, function(err, z, counter) {
                                            if (err !== null) {
                                                return callback(err);
                                            } else {
                                                console.log(pedidos, 'cantidad de producto pedido');
                                                var cant = counter;
                                                console.log(cant, 'la MP', z.name, 'se usan', cant);
                                                var prod = p.producto;
                                                var totalCant = cant * pedidos;
                                                var stockA = z.unitsInStock;
                                                console.log('el producto', z.name, 'tiene', z.unitsInStock);
                                                z.unitsInStock = parseFloat(stockA - totalCant).toFixed(2);
                                                /*if (stockA - totalCant > 0) {
                                                    var num = stockA - totalCant;
                                                    z.unitsInStock = num.toFixed(2);
                                                }
                                                else {
                                                    z.unitsInStock = 0;
                                                }*/
                                                console.log('el producto', z.name, 'le quedan', z.unitsInStock);
                                                // if(counter == (produccion.length -1)) {
                                                z.save(function(err) {
                                                    if (err) {
                                                        console.log('error MP actualizacion');
                                                        return callback(err);
                                                    } else {
                                                        console.log("stock MP actualizado");
                                                        //return callback(null, z);
                                                    }
                                                }); //end callback save
                                                // }

                                            }


                                        })
                                    }
                                }

                                c.unitsInStock = nuevoStock;

                                /* if (nuevoStock > 0) {
                                    c.unitsInStock = nuevoStock;
                                } else {
                                    c.unitsInStock = 0;
                                }*/

                                c.save(function(err) {
                                    if (err) {
                                        console.log('error actualizacion producto', err);
                                        return callback({ status: 'error', message: err });
                                    } else {
                                        if (count == (venta.products.length - 1)) {
                                            pedido.save(function(err) {
                                                if (err) {
                                                    console.log('error al guardar pedido', err);
                                                    return callback({ status: 'error', message: err });
                                                } else {
                                                    console.log(venta, "venta.save");
                                                    venta.save(function(err) {
                                                        if (err) {
                                                            return callback({ status: 'error', message: err });
                                                        } else {
                                                            condicionConId(venta.condicionVenta, function(c) {
                                                                if (venta.caja !== undefined) {
                                                                    cajaConId(venta.caja, function(s) {
                                                                        agregarCaja(venta, c.name, s);
                                                                        return callback({
                                                                            status: 'success',
                                                                            data: message
                                                                        });
                                                                    })
                                                                }

                                                            })
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        return callback({ status: 'success', data: c });
                                    }
                                });
                            }
                            //end callback save
                        });
                    }
                    // end for


                } else {
                    console.log("[E] se produjo un error al buscar el pedido: ", err);
                    return callback({ 'status': 'error', message: err });
                }
            })
    }

    function agregarCaja(venta, condicion, c) {
        if (condicion == 'Cheque') {
            c.cheques = c.cheques + venta.total;
        } else {
            if (condicion == 'Efectivo') {
                c.efectivo = c.efectivo + venta.total;
            } else {
                if (condicion == 'Tarjeta de Credito') {
                    c.credito = c.credito + venta.total;
                } else {
                    if (condicion == 'Tarjeta de Debito') {
                        c.debito = c.debito + venta.total;
                    }
                }
            }
        }
        c.total = c.cheques + c.efectivo + c.debito + c.debito;
        venta.saldoCaja = c.total;
        c.save(function(err) {
            if (err) {
                return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
            } else {
                console.log('Caja actualizada ok');
                venta.save(function(err) {
                    if (err) {
                        return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
                    } else {
                        console.log('guardado saldo caja ok en venta');
                    }
                })
            }
        });
    };

    function getEnterprises(callback) {
        Enterprise.find()
            .sort('-created')
            .exec(function(err, enterprises) {
                if (err) {
                    callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
                } else {
                    callback({ status: 'success', data: enterprises });
                }
            });
    };

    function productoConId(p, count, callback) {
        Product.findById(p)
            .populate('produccion.producto', 'name costPerUnit')
            .exec(function(err, product) {
                if (!err) {
                    return callback(null, product, count);
                } else {
                    console.log("[E] productoConId::Product.findById: ", err);
                    return callback(err);
                }
            });
    };

    function materiaConId(p, count, callback) {
        count = p.cantidad;
        Product.findById(p.producto)
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .exec(function(err, product) {
                if (!err) {
                    return callback(null, product, count);
                } else {
                    console.log("[E] materiaoConId::Product.findById: ", err);
                    return callback(err)
                }
            });
    };

    function condicionConId(c, callback) {
        Condicionventa.findById(c)
            .exec(function(err, condicion) {
                if (!err) {
                    return callback(condicion);
                } else {
                    console.log("error");
                }
            });
    };

    function cajaConId(c, callback) {
        Caja.findById(c)
            .exec(function(err, caja) {
                if (!err) {
                    return callback(caja);
                } else {
                    console.log("error");
                }
            });
    };

    function clientConId(c, callback) {
        Cliente.findById(c)
            .exec(function(err, client) {
                if (!err) {
                    return callback(client);
                } else {
                    console.log("error");
                }
            });
    };

    function finanzaConId(p, callback) {
        Finanza.findById(p)
            .exec(function(err, product) {
                if (!err) {
                    return callback(product);
                } else {
                    console.log("error");
                }
            });
    };
};