'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    User = mongoose.model('User'),
    Provider = mongoose.model('Provider'),
    Product = mongoose.model('Product'),
    Finanza = mongoose.model('Finanza'),
    Movimiento = mongoose.model('Movimiento'),
    Caja = mongoose.model('Caja'),
    Condicionventa = mongoose.model('Condicionventa'),
    Moment = require('moment'),
    Compra = mongoose.model('Compra'),
    commonFunc = require(path.resolve(  './modules/core/common/common.server.function'));

// Create the chat configuration
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
    socket.on('compra.update', function(message) {
        console.log("[+] evento de actualizacion de compra disparado!", message._id);
        updateCompra(message, function(result) {
            if (result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('compras.update', result.data);
            }
        });
    });

    function updateCompra(message, callback) {

        console.log("=============socket==========================");
        console.log(message._id);
        Compra.findById(message._id)
            .exec(function(err, item) {
                console.log(item);
                if (!err && item) {
                    var compra = item;

                    var uid = compra.user;

                    message.user = uid;

                    compra = _.extend(compra, message);

                    var idProvider = compra.proveedor;
                    var idCondicion = message.condicionVenta;
                    condicionConId(idCondicion, function(c) {
                        //console.log("[+] message: ", message);
                        if (message.estado == 'Finalizada') {
                            if (c.name == 'Cuenta Corriente') {
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

                                providerConId(idProvider, function(p) {
                                    var idFinanza = p.finanza;
                                    finanzaConId(idFinanza, function(z) {
                                        z.saldo = z.saldo + compra.total;
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
                                                        return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
                                                    } else {
                                                        console.log('todo piola');
                                                        compra.save(function(err) {
                                                            if (err) {
                                                                return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
                                                            } else {
                                                                return callback({ status: 'success', data: message });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }); //end callback save
                                    })
                                });
                            } else {
                                if (compra.caja !== undefined) {
                                    cajaConId(compra.caja, function(s) {
                                        agregarCaja(compra, c.name, s);
                                        callback({ status: 'success', data: message });
                                    })
                                }
                            }
                        } else {
                            if (message.estado == 'Pendiente de recepcion' && message.fechaRecepcion != undefined) {
                                var d = new Moment(compra.fechaRecepcion);
                                compra.filterDate = {
                                    year: d.year().toString(), // 2015
                                    quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', // 2015-1Q
                                    month: d.year().toString() + '-' + d.month().toString(), // 2015-7
                                    week: d.year().toString() + '-' + d.week().toString(), // 2015-29
                                    day: d.year().toString() + '-' + d.dayOfYear().toString(), // 2015-191
                                    dayOfWeek: d.weekday(), // 3 (Miercoles)
                                    Hour: d.hour() // 11
                                };
                                for (var i = 0; i < compra.products.length; i++) {
                                    var idProd = compra.products[i].product._id;
                                    var cant = compra.products[i].cantidad;
                                    actualizarStock(idProd,cant,compra.user);
                                };
                            }
                            compra.save(function(err) {
                                if (err) {
                                    return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
                                } else {
                                    return callback({ status: 'success', data: message });
                                }
                            });
                        }
                    });
                } else {
                    console.log("[E] se produjo un error al buscar la compra: ", err);
                }
            })
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
    }

    function condicionConId(c, callback) {
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

    function providerConId(p, callback) {
        Provider.findById(p)
            // .populate('user', 'displayName')
            // .populate('enterprise', 'name')
            .exec(function(err, product) {
                if (!err) {
                    return callback(product);
                } else {
                    console.log("error");
                }
            });
    };

    function finanzaConId(p, callback) {
        Finanza.findById(p)
            // .populate('user', 'displayName')
            // .populate('enterprise', 'name')
            .exec(function(err, product) {
                if (!err) {
                    return callback(product);
                } else {
                    console.log("error");
                }
            });
    };

    function cajaConId(c, callback) {
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

    function agregarCaja(compra, condicion, c) {
        if (condicion == 'Cheque') {
            c.cheques = c.cheques - compra.total;
        } else {
            if (condicion == 'Efectivo') {
                c.efectivo = c.efectivo - compra.total;
            } else {
                if (condicion == 'Tarjeta de Credito') {
                    c.credito = c.credito - compra.total;
                } else {
                    if (condicion == 'Tarjeta de Debito') {
                        c.debito = c.debito - compra.total;
                    }
                }
            }
        }
        c.total = c.cheques + c.efectivo + c.debito + c.debito;
        compra.saldoCaja = c.total;
        compra.save(function(err) {
            if (err) {
                console.log(err, 'error');
                return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
            } else {
                c.save(function(err) {
                    if (err) {
                        console.log(err);
                        return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
                    } else {
                        console.log('guardar caja ok');
                    }
                });
            }
        });
    };

    //joker's add
    var actualizarStock = function(id,cant,user){
        Product.findById(id)
            .exec(function(err, product) {
                if (err) return next(err);
                if (! product) return next(new Error('Failed to load Product ' + id));
                commonFunc.getStockByUserId(user, product, function(err, idxStock){
                    if (err)
                        return res.status(200).send({ message: "can't search userstock" });

                    if(idxStock!= null){
                        var lastStockValue 	= product.stocks[idxStock].unitsInStock;
                        var newValue = cant + lastStockValue;
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

};