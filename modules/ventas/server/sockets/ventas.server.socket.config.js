'use strict';

var _ = require('lodash'),
    fall = require('async-waterfall'),
    path = require('path'),
    mongoose = require('mongoose'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Moment = require('moment'),
    User = mongoose.model('User'),
    Venta = mongoose.model('Venta'),
    Product = mongoose.model('Product'),
    Enterprise = mongoose.model('Enterprise'),
    Finanza = mongoose.model('Finanza'),
    Movimiento = mongoose.model('Movimiento'),
    Caja = mongoose.model('Caja'),
    Cliente = mongoose.model('Cliente'),
    Condicionventa = mongoose.model('Condicionventa'),
    commonFunc = require(path.resolve(  './modules/core/common/common.server.function'));

module.exports = function (io, socket) {

    //get enterprises and create socket namespaces
    getEnterprises(function (result) {
        if (result.status !== 'success') {
            console.log('Error al recibir listado de empresas para el socket: ', result.message);
        } else {
            //console.log('data: ', JSON.stringify(result.data));
            if (result.data.length > 0) {
                var enterprises = result.data;
                var namespaces = {};

                enterprises.forEach(function (enterprise) {
                    namespaces[enterprise.name] = io.of('/' + enterprise.name);
                });

                //console.log('namespace:', namespaces);
            } else {
                console.log('Error, no se han creado empresas?');
            }
        }
    });

    socket.on('venta.update', function (message) {
        console.log("[+] evento de actualizacion de venta disparado!", message._id);
        updateVenta(message, function (result) {
            console.log('are you even called!!!', result);
            if (result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('ventas.update', result.data);
            }
        });
    });

    function updateVenta(message, callback) {
        Venta.findById(message._id)
            .populate('user')
            .populate('caja')
            .populate('tipoComprobante')
            .populate('orden')
            .populate('category1')
            .populate('condicionVenta')
            .populate('enterprise')
            .populate('cliente')
            .exec(function (err, venta) {
                if (err)
                    return callback({status: 'error', message: err});

                message.user = venta.user;
                var estadoOld = venta.estado;
                venta = _.extend(venta, message);
                venta.myDate = Date.now();

                if (message.estado === 'Anulada') {
                    var tasks = [];

                    var removingIndexes = [];
                    venta.products.forEach(function (entry, index) {
                        var task = function (taskCB) {
                            productoConId(entry.product._id || entry.product.id, function (err, foundProduct) {
                                if (err) return taskCB(err);

                                if (!foundProduct) {
                                    removingIndexes.push(index);
                                    taskCB();
                                } else {
                                    commonFunc.getStockByUserId(venta.user, foundProduct, function(err, idxStock){
                                        if(idxStock != null){
                                            foundProduct.stocks[idxStock].unitsInStock = foundProduct.stocks[idxStock].unitsInStock + entry.cantidad;
                                            var produccionTasks = [];
                                            if (foundProduct.produccion && foundProduct.produccion.length) {
                                                foundProduct.produccion.forEach(function (produccion) {
                                                    var produccionTask = function (produccionCB) {
                                                        productoConId(produccion.producto, function (err, foundProduccion) {
                                                            var totalCant = produccion.cantidad * entry.cantidad; // TODO: suspicious code need to review later
                                                            commonFunc.getStockByUserId(venta.user, produccion, function(err, idxStock1){
                                                                if(idxStock1 != null){
                                                                    foundProduccion.stocks[idxStock1].unitsInStock = foundProduccion.stocks[idxStock1].unitsInStock + totalCant;
                                                                }
                                                                foundProduccion.save(function (err) {
                                                                    if (err) {
                                                                        console.log('err123!@#', err);
                                                                    }
                                                                    produccionCB(err)
                                                                })
                                                            });
                                                        })
                                                    };
                                                    produccionTasks.push(produccionTask);
                                                })
                                            }
                                            fall(produccionTasks, function (err) {
                                                if (err) return taskCB(err);
                                                console.log('***************** line: 107');
                                                foundProduct.save(function (err) {
                                                    if (err) console.log('error in fall!', err);
                                                    taskCB(err);
                                                });
                                            })
                                        }else{
                                            taskCB(null);
                                        }
                                    });
                                }
                            })
                        };
                        tasks.push(task);
                    });
                    fall(tasks, function (err) {
                        if (err) return callback({status: 'error', message: err});

                        console.log('fall done????', err);

                        for (var i = venta.products.length - 1; i >= 0; i--) {
                            if (removingIndexes.indexOf(i) !== -1) {
                                venta.products.splice(i, 1);
                            }
                        }

                        venta.total = 0;
                        venta.subtotal = 0;
                        venta.neto = 0;
                        var iva = 0;

                        venta.products.forEach(function (singleProduct) {
                            venta.subtotal += singleProduct.total;
                            singleProduct.subtotal = singleProduct.cantidad * singleProduct.product.unitPrice;
                            if (singleProduct.product.tax != 1) {
                                iva += ((singleProduct.cantidad * singleProduct.product.unitPrice) * (1 - (1 / (1 + singleProduct.product.tax / 100))))
                            }
                        });

                        venta.descuentoValor = (venta.subtotal * venta.descuentoPorcentaje) / 100;
                        venta.neto = venta.subtotal - venta.descuentoValor;
                        venta.totalTax = iva;
                        venta.total = venta.neto + venta.totalTax;
                        console.log('***************** line: 146');
                        venta.save(function (err) {
                            if (err) return callback({status: 'error', message: err});
                            callback({status: 'success', data: message});
                            condicionConId(venta.condicionVenta, function (err, condicionVenta) {
                                if (venta.caja !== undefined && condicionVenta.name!== 'Cuenta Corriente' && estadoOld=='Finalizada') {
                                    cajaConId(venta.caja, function (err, s) {
                                        removeFromCaja(venta, condicionVenta.name, s, function (err) {
                                            if (err) return callback({status: 'error', message: err});
                                            callback({status: 'success', data: message})
                                        })
                                    })
                                } else {
                                    callback({status: 'success', data: message})
                                }
                                
                            })
                        })
                    })
                } else {
                    console.log('***************** line: 153');
                    venta.save(function (err) {
                        if (err) return callback({status: 'error', message: err});
                        if (venta.estado !== 'Finalizada') return callback({status: 'success', data: message});
                        condicionConId(venta.condicionVenta, function (err, condicionVenta) {
                            if (condicionVenta.name === 'Cuenta Corriente') {
                                crearMovimiento(venta, function (err) {
                                    if (err) return callback({status: 'error', message: err});
                                    callback({status: 'success', data: message})
                                })
                            } else {
                                if (venta.caja !== undefined) {
                                    cajaConId(venta.caja, function (err, s) {
                                        agregarCaja(venta, condicionVenta.name, s, function (err) {
                                            if (err) return callback({status: 'error', message: err});
                                            callback({status: 'success', data: message})
                                        })
                                    })
                                } else {
                                    callback({status: 'success', data: message})
                                }
                            }
                        });
                    })
                }
            })
    }

    function crearMovimiento(venta, callback) {

        var idClient = venta.cliente;
        console.log(venta);

        var f = new Movimiento();
        f.client = venta.cliente;
        f.caja = venta.caja;
        f.condicion = venta.condicionVenta;
        f.comprobante = venta.tipoComprobante._id;
        f.numero = venta.comprobante;
        f.fecha = venta.created;
        f.estado = 'haber';
        f.monto = venta.total;
        f.saldo = venta.total;
        f.enterprise = venta.enterprise;
        f.deleted = false;
        f.created = Date.now();
        f.user = venta.user;

        clientConId(idClient, function (err, c) {
            if (err) return callback(err);
            var idFinanza = c.finanza;
            finanzaConId(idFinanza, function (err, z) {
                if (err) return callback(err);
                z.saldo = z.saldo + venta.total;
                z.update = Date.now();
                console.log('***************** line: 207');
                z.save(function (err) {
                    if (err) return callback(err);
                    console.log("fianza actualizada ok");
                    f.saldo = z.saldo;
                    f.finanza = idFinanza;
                    console.log('***************** line: 213');
                    f.save(callback);

                }); //end callback save
            })
        });
    }

    function agregarCaja(venta, condicion, c, callback) {
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
        console.log('***************** line: 238');
        c.save(function (err) {
            if (err) return callback(err);
            console.log('Caja actualizada ok');
            console.log('***************** line: 242');
            venta.save(callback)
        });
    }

    function removeFromCaja(venta, condicion, caja, callback){
        if (condicion == 'Cheque') {
            caja.cheques = caja.cheques - venta.total;
        } else if(condicion == 'Efectivo') {
            caja.efectivo = caja.efectivo - venta.total;
        }else if(condicion == 'Tarjeta de Credito'){
            caja.credito = caja.credito - venta.total;
        }else if (condicion == 'Tarjeta de Debito') {
            caja.debito = caja.debito - venta.total;
        }
        
        caja.total = caja.cheques + caja.efectivo + caja.debito + caja.debito;
        venta.saldoCaja = caja.total;
        console.log('***************** line: 268');
        caja.save(function (err) {
            if (err) return callback(err);
            console.log('Caja removed ok');
            console.log('***************** line: 272');
            venta.save(callback)
        });

    }

    function getEnterprises(callback) {
        Enterprise.find().sort('-created').exec(function (err, enterprises) {
            if (err) {
                callback({status: 'error', message: errorHandler.getErrorMessage(err)});
            } else {
                callback({status: 'success', data: enterprises});
            }
        });
    }

    function condicionConId(c, callback) {
        Condicionventa.findById(c).exec(callback);
    }

    function clientConId(c, callback) {
        Cliente.findById(c).exec(callback);
    }

    function finanzaConId(p, callback) {
        Finanza.findById(p).exec(callback);
    };

    function cajaConId(c, callback) {
        Caja.findById(c).exec(callback);
    };

    function productoConId(id, callback) {
        Product.findById(id)
            .populate('user')
            .populate('enterprise')
            // .populate('category1')
            // .populate('category2')
            .populate('provider')
            .populate('produccion.producto')
            .exec(callback);
    };
};
