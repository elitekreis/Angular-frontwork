'use strict';
// Include the async package
var async = require("async");
process.env.TZ = 'America/Argentina/Buenos_Aires';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fall = require('async-waterfall'),
    path = require('path'),
    mongoose = require('mongoose'),
    Moment = require('moment'),
    User = mongoose.model('User'),
    Venta = mongoose.model('Venta'),
    Cliente = mongoose.model('Cliente'),
    Product = mongoose.model('Product'),
    Entrega = mongoose.model('Entrega'),
    Finanza = mongoose.model('Finanza'),
    Movimiento = mongoose.model('Movimiento'),
    Caja = mongoose.model('Caja'),
    Sucursal = mongoose.model('Sucursal'),
    Condicionventa = mongoose.model('Condicionventa'),
    Comprobante = mongoose.model('Comprobante'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    admin = require("firebase-admin"),
    commonFunc = require(path.resolve(  './modules/core/common/common.server.function'));

var serviceAccount = require("../certs/idees-pos-printer.json");
// idees-pos-printer.firebaseio
// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://idees-pos-printer.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("/");
var usersRef = ref.child("receipts");

/**
 * Create a Venta
 */
exports.create = function (req, res) {
    var productos = Product.find();
    var venta = new Venta(req.body);
    venta.estado = 'Finalizada';
    venta.created = new Date();
    var sub = 0;
    var totTax1 = 0;
    var totTax2 = 0;
    var totTax3 = 0;
    var tax1 = [];
    var tax2 = [];
    var tax3 = [];
    var x = -1;
    // var z = 0;
    var idCondicion = venta.condicionVenta;

    //*****Actualiza el ultimo numero del comprobante correspondiente
    comprobanteConId(venta.tipoComprobante, function (err, comp) {
        console.log("#################################################46", err);
        if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

        comp.ultimoNumero = venta.comprobante;
        comp.save(function (err) {
            console.log("#################################################51", err);
            if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

            productosDeCliente(venta.cliente, function (err, client) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                for (var i = 0; i < venta.products.length; i++) {
                    if (client.productosAsociados.indexOf(venta.products[i].product._id) < 0) {
                        client.productosAsociados.push(venta.products[i].product._id);
                    }

                }

                client.save(function (err) {

                    console.log("#################################################61", err);

                    if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

                    var productTasks = [];

                    venta.products.forEach(function (entry) {
                        console.log("#####for each entered#####");
                        var productTask = function (productCallback) {
                            productoConId(entry, function (err, foundProduct) {

                                console.log("#####for productoConId entered#####");
                                if (err) return productCallback(err);
                                
                                commonFunc.getStockByUserId(venta.user, foundProduct, function(err, idxStock){
                                    console.log("#####stock By user entered#####");
                                    if (err)
                                        return res.status(200).send({ message: "can't search userstock" });
                                    console.log("#####idx Stock check before#####" + idxStock);
                                    if(idxStock!= null){
                                        var nuevoStock = foundProduct.stocks[idxStock].unitsInStock - entry.cantidad;
                                        var produccionTasks = [];
    
                                        console.log("#####foundProduct.produccion.length#####" + foundProduct.produccion.length);
                                        if (foundProduct.produccion && foundProduct.produccion.length) {
                                            console.log("#####produccion entered#####");
                                            //console.log('foundProduct', foundProduct);
    
                                            foundProduct.produccion.forEach(function (produccion) {
                                                console.log("#####Product for each entered#####");
                                                //console.log('produccion', produccion);
    
                                                var produccionTask = function (produccionCallback) {
                                                    console.log("#####produccionTask for each entered#####");
                                                    materiaConId(produccion.producto, function (err, producto) {
                                                        if (err) return produccionCallback(err);
                                                        var totalCant = produccion.cantidad * entry.cantidad; // TODO: need to review
                                                        commonFunc.getStockByUserId(venta.user, producto, function(err, idxStock1){
                                                            if (!err && idxStock1 != null){
                                                                producto.stocks[idxStock1].unitsInStock = parseFloat(producto.stocks[idxStock1].unitsInStock - totalCant).toFixed(2);
    
    
                                                                /*if (producto.unitsInStock - totalCant >= 0) {
                                                                    producto.unitsInStock = parseInt((producto.unitsInStock - totalCant), 10).toFixed(2);
                                                                } else {
                                                                    return produccionCallback({errors: {not_available: {message: 'not available in stock ' + producto._id}}})
                                                                }*/
                                                            }
                                                            producto.save(function (err) {
                                                                if (err) return produccionCallback(err);
                                                                produccionCallback(null);
                                                            });
                                                        });
                                                    })
                                                };
                                                console.log("#####PproducctionTasks pushed#####");
                                                produccionTasks.push(produccionTask);
                                            })
                                        }
                                        fall(produccionTasks, function (err) {
                                            console.log("#####produccionTask fall#####");
                                            if (err) return productCallback(err);
                                            
                                            foundProduct.stocks[idxStock].unitsInStock = nuevoStock;
                                            /* if (nuevoStock >= 0) {
                                                foundProduct.unitsInStock = nuevoStock;
                                            } else {
                                                return produccionCallback({errors: {not_available: {message: 'not available in stock ' + foundProduct._id}}})
                                            }*/
    
                                            //console.log(productCallback);
                                            foundProduct.save(productCallback(null));
                                        })
                                    }else{
                                        productCallback(null);
                                    }
                                    console.log("##########idx stock after####124", err);
                                });
                                console.log("##########first getstock after####124", err);
                            })
                            console.log("##########ProductTask last####124", err);
                        };

                        console.log("#####productTask push#####");
                        productTasks.push(productTask);
                    });
                    console.log("#####product foreach after#####");

                    fall(productTasks, function (err) {
                        console.log("#################################################124", err);
                        if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

                        venta.user = req.user;
                        var d = new Moment(venta.created);

                        venta.filterDate = {
                            year: d.year().toString(),
                            quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q',
                            month: d.year().toString() + '-' + d.month().toString(),
                            week: d.year().toString() + '-' + d.week().toString(),
                            day: d.year().toString() + '-' + d.dayOfYear().toString(),
                            dayOfWeek: d.weekday(),
                            Hour: d.hour()
                        };

                        for (var i = 0; i < venta.products.length; i++) {
                            var additionalIva = parseFloat((1 - (1 / (1 + venta.products[i].product.tax / 100)))) * parseFloat(venta.products[i].product.unitPrice);
                            if (parseFloat(venta.products[i].product.tax) == 10.5) {
                                tax1.push(additionalIva * parseInt(venta.products[i].cantidad));
                            }
                            if (parseFloat(venta.products[i].product.tax) == 21.00) {
                                tax2.push(additionalIva * parseInt(venta.products[i].cantidad));
                            }
                            if (parseFloat(venta.products[i].product.tax) == 27.00) {
                                tax3.push(additionalIva * parseInt(venta.products[i].cantidad));
                            }
                            var desc = parseInt(venta.products[i].descuento) * venta.products[i].product.unitPrice / 100;
                            var finalPrice = venta.products[i].product.unitPrice - desc;
                            sub = sub + parseInt(venta.products[i].cantidad) * finalPrice;
                        }

                        if (tax1.length > 0) {
                            for (i = 0; i < tax1.length; i++) {
                                // total del tax 1
                                var totTax1 = totTax1 + parseInt(tax1[i]);
                            }
                        }

                        if (tax2.length > 0) {
                            for (i = 0; i < tax2.length; i++) {
                                // total del tax 1
                                var totTax2 = totTax2 + parseInt(tax2[i]);
                            }
                        }

                        if (tax3.length > 0) {
                            for (i = 0; i < tax3.length; i++) {
                                // total del tax 3
                                var totTax3 = totTax3 + parseInt(tax3[i]);
                            }
                        }

                        var descV = sub * venta.descuentoPorcentaje / 100;
                        var net = sub - descV;
                        var total = net + totTax1 + totTax2 + totTax3;

                        venta.save(function (err) {
                            if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

                            condicionConId(venta.condicionVenta, function (err, foundCondiction) {
                                if (foundCondiction.name === 'Cuenta Corriente') {
                                    crearMovimiento(venta, function (err) {
                                        if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                        if (venta.delivery) {
                                            creaEntrega(venta, function (err, entrega) {
                                                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                                res.jsonp(venta);
                                            })
                                        }
                                        else {
                                            res.jsonp(venta);
                                        }
                                    });
                                } else {
                                    if (venta.caja) {
                                        cajaConId(venta.caja, function (err, caja) {
                                            if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                            agregarCaja(venta, foundCondiction.name, caja, function (err) {
                                                if (venta.delivery) {
                                                    creaEntrega(venta, function (err, entrega) {
                                                        if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                                                        res.jsonp(venta);
                                                    })
                                                }
                                                else {
                                                    res.jsonp(venta);
                                                }
                                            })
                                        })
                                    }
                                }
                            })
                        })
                    })
                });
            });
        });
    });
};

/**
 * Show the current Venta
 */
exports.read = function (req, res) {
    res.jsonp(req.venta);
};

/**
 * Update a Venta
 */
exports.update = function (req, res) {
    console.log("========== ventas")
    var venta = req.venta;
    venta = _.extend(venta, req.body);

    //*****Si se anula la venta debo retornar el stock del producto que reste cuando la cree
    if (venta.estado == 'Anulada') {
        //*****Por cada producto actualizo el stock
        for (var i = 0; i < venta.products.length; i++) {
            var actual = venta.products[i];
            productoConId(venta.products[i], function (c) {
                var produccion = c.produccion;
                commonFunc.getStockByUserId(venta.user, venta.products[i], function(err, idxStock){
                    if (err)
                        return res.status(200).send({ message: "can't search userstock" });

                    if(idxStock!= null){
                        var actualStock = c.stocks[idxStock].unitsInStock;
                        var pedidos = actual.cantidad;
                        var arrayProduccion = [];
                        if (produccion.length > 0) {
                            for (var i = 0; i < produccion.length; i++) {
                                var n = {
                                    producto: {},
                                    cantidad: undefined,
                                    total: undefined
                                };
                                var p = produccion[i];
                                var cant = p.cantidad;
                                n.cantidad = cant;
                                n.total = p.total;
                                var prod = p.producto;
                                var totalCant = cant * pedidos;
                                commonFunc.getStockByUserId(venta.user, venta.products[i], function(err, idxStock1){
                                    if(!err && idxStock1 != null){
                                        var stockA = prod.stocks[idxStock1].unitsInStock;
                                        var num = parseFloat(stockA) + parseFloat(totalCant);
                                        prod.stocks[idxStock1].unitsInStock = num;
                                    }
                                    n.producto = prod;
                                    arrayProduccion.push(n);
                                    materiaConId(prod, function (z) {
                                        z.save(function (err) {
                                            if (err) {
                                                console.log('ERROR UNOO');
                                                // return res.status(400).send({
                                                //  message: errorHandler.getErrorMessage(err)
                                                // });
                                            } else {
                                                // console.log(z.unitsInStock, 'units in stock');
                                                console.log("stock MP actualizado");
                                            }
                                        }); //end callback save
                                    });
                                });
                            }
                            c.produccion = arrayProduccion;
                        }
                        c.stocks[idxStock].unitsInStock = parseInt(actualStock) + parseInt(pedidos);
                        c.save(function (err) {
                            if (err) {
                                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                            } else {
                                // console.log("stock actualizado");
                            }
                        }); //end callback save
                    }
                });
            });
        }
        ; // end for
    }
    venta.save(function (err) {
        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(venta);
        }
    });
};

/**
 * Delete an Venta
 */
exports.delete = function (req, res) {
    var venta = req.venta;
    venta.deleted = true;
    venta.save(function (err) {
        if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
        } else {
            res.jsonp(venta);
        }
    });
};

/**
 * List of Ventas
 */
exports.list = function (req, res) {
    // Inicio de càlculo de semana actual //
    var week = req.query.w || null;
    var Year = req.query.y || null;
    var estado = req.query.estado || null;
    var pagina = parseInt(req.query.p) || null;
    var limite = parseInt(req.query.pcount) || 2;

    // fin de càlculo de semana actual //
    var start = new Date;
    var enterprise = req.query.e || null;

    //para que devuelva todos (para calcular deuda por ejemplo)
    if (enterprise !== null) {

        Venta.find({
            enterprise: enterprise,
            estado: estado,
            deleted: false
        }).skip(pagina).limit(limite).sort('-created').populate('condicionVenta', 'name').populate('user', 'displayName').populate('enterprise', 'name').populate('cliente', 'name address phone').populate('category1', 'name').exec(function (err, ventas) {
            if (err) {
                console.log('err on 349', err);
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {
                var end = new Date();
                // console.log('[+] ventas::list finalizado en: %sms', end - start);
                res.jsonp(ventas);
            }
        });
    } else {
        Venta.find({
            'filterDate.week': Year + '-' + week
        }).limit(100).sort('-created').populate('condicionVenta', 'name').populate('user', 'displayName').populate('enterprise', 'name').populate('cliente', 'name address phone').populate('category1', 'name').exec(function (err, ventas) {
            if (err) {
                console.log('err on 362');
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {
                var end = new Date();
                console.log('[+] ventas::list finalizado en: %sms', end - start);
                res.jsonp(ventas);
            }
        });
    }
};

exports.loadMore = function (req, res) {
    var last = req.query.last || null;
    var enterprise = req.query.e || null;
    var estado = req.query.estado || null;
    var limit = req.query.limit || null;
    var pagina = parseInt(req.query.p) || 0;
    console.log('ventas.loadmore : ' + pagina + " , " + limit);

    if (last) {
        Venta.find({ enterprise: enterprise, estado: estado, deleted: false, created: { $lt: last } })
            .skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('condicionVenta', 'name')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                res.jsonp(ventas);
            })
    } else {

        Venta.find({ enterprise: enterprise, estado: estado, deleted: false })
            .skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('condicionVenta', 'name')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                res.jsonp(ventas);
            })
    }
};

exports.loadMoreByCaja = function (req, res) {
    var last = req.query.last || null;
    var enterprise = req.query.e || null;
    var estado = req.query.estado || null;
    var limit = req.query.limit || null;
    var pagina = parseInt(req.query.p) || 0;

    var cajaId = req.query.caja || null;

    console.log("================================================");
    
    if (last) {

        Venta.find({ enterprise: enterprise, estado: estado, deleted: false, created: { $lt: last } })
            .skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('condicionVenta', 'name')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                res.jsonp(ventas);
            })
    } else {

        Venta.find({ enterprise: enterprise, estado: estado, deleted: false, caja: cajaId })
            .skip(pagina)
            .limit(limit)
            .sort('-created')
            .populate('condicionVenta', 'name')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('cliente', 'name address phone')
            .populate('category1', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                res.jsonp(ventas);
            })
    }
};

exports.loadmoreByCaja_Date = function (req, res) {
    
    var enterprise  = req.query.e || null;
    var estado      = req.query.estado || null;
    var startdate   = req.query.start || null;
    var enddate     = req.query.end || null;
    var cajaId      = req.query.caja || null;
    
    Venta.find({enterprise: enterprise, estado: estado, deleted: false, created: { $gte: startdate, $lte: enddate } })
        .sort('-created')
        .populate('condicionVenta','name')
        .populate('user', 'displayName')
        .populate('enterprise', 'name')
        .populate('cliente', 'name address phone')
        .populate('category1', 'name')
        .exec(function (err, ventas) {
            if (err) return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            res.jsonp(ventas);
        })
    
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

    if (Moment(last) > endDate) {
        last = endDate.clone();
    }

    if (last) {
        Venta.find({ impuestoId: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: Moment(last).format() }, totalTax: { $gt: 0 } })
            .limit(limit)
            .sort('-created')
            .populate('cliente', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                res.jsonp(ventas);
            })
    } else {
        Venta.find({ impuestoId: impuesto, deleted: false, created: { $gt: startDate.format(), $lt: endDate.format() }, totalTax: { $gt: 0 } })
            .limit(limit)
            .sort('-created')
            .populate('cliente', 'name')
            .exec(function (err, ventas) {
                if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
                res.jsonp(ventas);
            })
    }
};

exports.ventasResumen = function (req, res) {
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

    var returnVentas = [];

    Venta
        .find({
            enterprise: enterprise,
            deleted: false,
            myDate: {
                $gt: startDate.format(),
                $lt: endDate.format()
            },
            estado: 'Finalizada'
        })
        .populate('puesto', 'centroDeCosto')
        .populate('tipoComprobante')
        .exec(function (err, ventas) {
            if (err) {
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {
                ventas.forEach(function (venta) {
                    if (venta.puesto && venta.puesto.centroDeCosto == centroDeCosto) {
                        returnVentas.push(venta);
                    }
                });

                res.jsonp(returnVentas);
            }
        });
};

exports.select = function (req, res) {
    // Inicio de càlculo de semana actual //
    var week = req.query.w || null;
    var Year = req.query.y || null;
    var estado = req.query.estado || null;
    var pagina = parseInt(req.query.p) || null;
    var limite = parseInt(req.query.pcount) || null;

    var start = new Date;
    var enterprise = req.query.e || null;
    console.log("enterprise")
    console.log(enterprise)


    //para que devuelva todos (para calcular deuda por ejemplo)
    if (enterprise !== null) {
        console.log('here!!!!');
        Venta.find({
            enterprise: enterprise,
            estado: estado,
            deleted: false
        }).limit(10).populate('user', 'displayName').populate('enterprise', 'name').populate('cliente', 'name address phone').populate('category1', 'name').exec(function (err, ventas) {
            if (err) {
                console.log('err on 349', err);
                return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
            } else {
                var end = new Date();
                console.log('[+] ventas::list finalizado en: %sms', end - start, ventas.length);
                res.jsonp(ventas);
            }
        });
    } else {
        return res.status(400).send({ message: 'something went wrong' });
    }
};

exports.print = function (req, res) {
    var orden = req.body.orden;
    var store = req.body.storeName;

    var test_string = '$bighw$ Idees Manager\n\n';

    test_string += '$big$' + orden.created.substring(8, 10) + '/' + orden.created.substring(5, 7) + '/' + orden.created.substring(2, 4) + "  " + orden.created.substring(11, 19);
    test_string += '\n$small$';

    for (var i = 0; i < orden.products.length; i++) {
        test_string +=
            orden.products[i].product.name
            + '   '
            + orden.products[i].cantidad
            + 'x'
            + orden.products[i].product.unitPrice + '$    '
            + orden.products[i].total + '$';
        test_string += '\n';
    }

    test_string += '\n';
    test_string += orden.observaciones || "";
    test_string += '\nDescuento(%): ' + orden.descuentoPorcentaje + '  Descuento($): ';
    test_string += orden.descuentoValo || "";
    test_string += '$\nSubtotal: ' + orden.subtotal + '$ ' + 'Neto: ' + orden.neto + '$ ' + 'Total tax: ' + orden.totalTax + '$';
    test_string += '\n';
    test_string += '\n$big$';
    test_string += 'Total: $' + orden.total;
    test_string += '\n';
    test_string += '---------------------------------';
    test_string += '\n\n\n\n\n';

    usersRef.push({
        data: {
            timestamp: admin.database.ServerValue.TIMESTAMP,
            pdf: test_string,
            name: store
        },
        notification: {
            title: 'Test title',
            body: 'Body title'
        }
    });

    return res.json(200);
};

/**
 * Venta middleware
 */
exports.ventaByID = function (req, res, next, id) {
    Venta.findById(id).populate('user', 'displayName').populate('enterprise', 'name').populate('tipoComprobante').populate('cliente', 'name address phone').populate('category1', 'name').populate('condicionVenta', 'name').populate('caja', 'name').exec(function (err, venta) {
        if (err)
            return next(err);
        if (!venta)
            return next(new Error('Failed to load Venta ' + id));
        req.venta = venta;
        next();
    });
};

//retorna los productos del cliente
function productosDeCliente(clientId, callback) {
    Cliente.findById(clientId).populate('user', 'displayName').populate('enterprise', 'name').populate('sub', 'name').populate('contacts').populate('taxCondition', 'name').exec(function (err, cliente) {
        if (err)
            return callback(err);
        callback(null, cliente);
    });
}

//retorna un producto con id
function productoConId(productObject, callback) {
    Product.findById(productObject.product._id).populate('user', 'displayName').populate('enterprise', 'name').populate('produccion.producto').exec(function (err, product) {
        if (err)
            return callback(err);
        callback(null, product);
    });
}

function finanzaConId(finanzaId, callback) {
    Finanza.findById(finanzaId).exec(function (err, finanza) {
        if (err)
            return callback(err);
        callback(null, finanza)
    });
}

function clientConId(clientId, callback) {
    Cliente.findById(clientId).exec(function (err, client) {
        if (err)
            return callback(err);
        callback(null, client)
    });
}

function cajaConId(cajaId, callback) {
    Caja.findById(cajaId).exec(function (err, caja) {
        if (err)
            return callback(err);
        callback(null, caja)
    });
}

function materiaConId(productId, callback) {
    Product.findById(productId).populate('user', 'displayName').populate('enterprise', 'name').exec(function (err, product) {
        if (err)
            return callback(err);
        callback(null, product)
    });
}

//retorna un comprobante con id
function comprobanteConId(comprobanteId, callback) {
    Comprobante.findById(comprobanteId).exec(function (err, comp) {
        if (err)
            return callback(err);
        callback(null, comp)
    });
}

//retorna un comprobante con nombre
function comprobanteConNombre(comprobanteName, callback) {
    Comprobante.findOne({ name: comprobanteName }).exec(function (err, comp) {
        if (err)
            return callback(err);
        callback(null, comp);
    });
}

function condicionConId(condicionId, callback) {
    Condicionventa.findById(condicionId).exec(function (err, condicion) {
        if (err)
            return callback(err);
        callback(null, condicion)
    });
}

//crea entrega si la venta fue cerrada y era p delivery
function creaEntrega(venta, callback) {
    var entrega = new Entrega();
    //ultimo remito
    comprobanteConNombre('Remito', function (err, comp) {
        if (err)
            return callback(err);

        var ultimoNumero = parseInt(comp.ultimoNumero) + 1;
        console.log('var nuevo ultimo numero', ultimoNumero);
        entrega.numero = ultimoNumero;
        entrega.tipoComprobante = comp._id;
        entrega.venta = venta._id;
        entrega.estado = 'pendiente';
        entrega.products = venta.products;
        entrega.cliente = venta.cliente;
        entrega.observaciones = venta.observaciones;
        entrega.subtotal = venta.subtotal;
        entrega.neto = venta.neto;
        entrega.tax1 = venta.tax1;
        entrega.tax2 = venta.tax2;
        entrega.tax3 = venta.tax3;
        entrega.totalTax = venta.totalTax;
        entrega.total = venta.total;
        entrega.condicionVenta = venta.condicionVenta;
        entrega.enterprise = venta.enterprise;
        entrega.filterDate = venta.filterDate;
        entrega.fechaEntrega = venta.myDate;
        entrega.user = venta.user;
        entrega.save(function (err) {
            if (err)
                return callback(err);

            comp.ultimoNumero = ultimoNumero;
            comp.save(function (err) {
                if (err)
                    return callback(err);
                callback(null, entrega);
            });
        });
    });
}

//agrega el total de la venta a la caja seleccionada, segun la condicion de venta
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
    c.total = c.cheques + c.efectivo + c.credito + c.debito;
    venta.saldoCaja = c.total;
    c.save(function (err) {
        if (err)
            return callback(err);
        venta.save(callback)
    });
}

//crea un nuevo movimiento para las finanzas cuando se crea una venta
function crearMovimiento(venta, callback) {

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

    console.log('idClient = ', idClient);

    clientConId(idClient, function (err, c) {
        if (err)
            return callback(err);

        console.log("c.finanza = ", c.finanza);
        var idFinanza = c.finanza;
        // var idFinanza = "56ddef1b151aed0b0009e1cb";
        if (!c.finanza) {
            console.log("There is no finaza")
            return "There is no finaza";
        }

        finanzaConId(idFinanza, function (err, z) {
            if (err)
                return callback(err);

            if (!z) {
                console.log("There is no Document")
                return "There is no Document";
            }
            console.log('z = ', z);
            z.saldo = z.saldo + venta.total;
            z.update = Date.now();
            z.save(function (err) {
                if (err)
                    return callback(err);

                console.log("fianza actualizada ok");
                f.saldo = z.saldo;
                f.finanza = idFinanza;
                f.save(callback);
            }); //end callback save
        })
    });
}
