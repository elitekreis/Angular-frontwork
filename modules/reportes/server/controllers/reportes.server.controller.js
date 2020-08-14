'use strict';
// Include the async package
var async = require("async");
var fall = require("async-waterfall");

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Venta = mongoose.model('Venta'),
    Puesto = mongoose.model('Puesto'),
    Compra = mongoose.model('Compra'),
    Cliente = mongoose.model('Cliente'),
    Category = mongoose.model('Category'),
    Provider = mongoose.model('Provider'),
    Aggrout = mongoose.model('Aggrout'),
    Moment = require('moment'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current Report
 */
exports.read = function(req, res) {
    res.jsonp({});
};

exports.list = function(req, res) {
    console.log('[+] Reportes::list::fired!');
};

exports.reporteVentaPorQ = function(req, res) {
    var enterprise = req.query.e || null;
    var quarter = req.params.quarter || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (quarter === null) {
        return res.status(400).send({ message: 'You must specify the quarter of the year (2015-1Q, 2015-1Q, 2015-3Q or 2015-4Q)' });
    }

    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.quarter': quarter, estado: 'Finalizada' } },
            { $group: { _id: { estado: '$estado', week: '$filterDate.week' }, balance: { $sum: '$total' } } },
            //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
            { $project: { resultado: '$_id', balance: 1, _id: 0 } }
            //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result:  ', result);
            res.jsonp(result);
        });
};

exports.reporteVentaPorRange = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);

    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $project: { key: '$_id', _id: 1, total: 1, products: 1, puesto: 1 } },
            { $out: "aggrouts" }
        ])
        .allowDiskUse(true)
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by month', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            Aggrout.find({}).exec(function(err, result) {
                if (err) {
                    console.log('[-] Error aggrouts', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }

                var returnData = {
                    balance: 0,
                    byProduct: [],
                    byCategory: [],
                    byPuesto: []
                };

                result.forEach(function(entry) {
                    returnData.balance = returnData.balance + entry.total;

                    entry.products.forEach(function(product) {
                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }
                    });

                    if (!entry.puesto) {
                        if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                            returnData.byPuesto.push({
                                from: "others",
                                total: entry.total,
                                byCategory: [],
                                byProduct: []
                            });

                        } else {
                            returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                        }
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        })

                    } else {
                        if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                            returnData.byPuesto.push({
                                from: entry.puesto,
                                total: entry.total,
                                byCategory: [],
                                byProduct: []
                            });
                        } else {
                            returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                        }
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        })
                    }
                })

                returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
                returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

                returnData.byProduct.forEach(function(entry) {
                    entry.percent = (entry.total / returnData.balance) * 100
                })

                returnData.byCategory.forEach(function(entry) {
                    entry.percent = (entry.total / returnData.balance) * 100
                })
                returnData.byPuesto.forEach(function(puesto) {
                    puesto.byProduct = _.sortBy(puesto.byProduct, ['total']).reverse();
                    puesto.byCategory = _.sortBy(puesto.byCategory, ['total']).reverse();

                    puesto.byProduct.forEach(function(entry) {
                        entry.percent = (entry.total / puesto.total) * 100
                    })

                    puesto.byCategory.forEach(function(entry) {
                        entry.percent = (entry.total / puesto.total) * 100
                    })
                });

                console.log('[+] Report::sale success', result);

                res.jsonp(returnData);
            })
        })
}

exports.reporteCompraPorRange = function(req, res) {

    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);

    Compra.find({ enterprise: enterprise, 'fechaRecepcion': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by month', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var returnData = {
                balance: 0,
                byProduct: [],
                byCategory: [],
                byPuesto: []
            };

            result.forEach(function(entry) {

                returnData.balance = returnData.balance + entry.total;
                if (!entry.puesto) {
                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }
                }
                // if (entry.products.constructor === Array) {
                entry.products.forEach(function(product) {
                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: product.product.category2.name,
                                total: product.total,
                                cantidad: product.cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                        }
                    }

                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                            returnData.byProduct.push({
                                name: product.product.name,
                                total: product.total,
                                cantidad: product.cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                        }
                    }

                    /*costo de centro products and categories*/
                    if (!entry.puesto) {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {

                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name })].total += product.total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }
                    }
                })
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            console.log('[+] Report::sale success', result);

            res.jsonp(returnData);
        })
        /*})*/
}

exports.reporteVentaPorMonthDetailed = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.month || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month of the year (2015-10, 2015-11 etc)' });
    }

    Venta.find({ enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by month', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var returnData = {
                balance: 0,
                byProduct: [],
                byCategory: [],
                byPuesto: []
            };

            result.forEach(function(entry) {
                returnData.balance = returnData.balance + entry.total;

                if (entry.products.length > 1) {
                    entry.products.forEach(function(product) {

                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }
                    })
                } else {

                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: entry.products[0].product.category2.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                        }
                    }


                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: entry.products[0].product.name }) === -1) {
                            returnData.byProduct.push({
                                name: entry.products[0].product.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                        }
                    }
                }
                if (!entry.puesto) {

                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }
                    if (entry.products.length > 1) {
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {

                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {

                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }

                        })
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }

                    if (entry.products.length > 1) {
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        })
                    } else {

                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                }
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })
            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })
            returnData.byPuesto.forEach(function(puesto) {
                puesto.byProduct = _.sortBy(puesto.byProduct, ['total']).reverse();
                puesto.byCategory = _.sortBy(puesto.byCategory, ['total']).reverse();

                puesto.byProduct.forEach(function(entry) {
                    entry.percent = (entry.total / puesto.total) * 100
                })

                puesto.byCategory.forEach(function(entry) {
                    entry.percent = (entry.total / puesto.total) * 100
                })
            });

            res.jsonp(returnData);
        })


}

exports.reporteCompraPorMonthDetailed = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.month || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month of the year (2015-10, 2015-11 etc)' });
    }

    
    var startDate;
    var endDate;

    if(month) {
        var splitStr = month.split('-');
        startDate = Moment().year(splitStr[0]).month(splitStr[1]).startOf("month");
        endDate = startDate.clone().endOf('month');
    }


    //Compra.find({ enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' })
    Compra.find({ enterprise: enterprise, fechaRecepcion: {
                $gt: startDate.format(),
                $lt: endDate.format()
            }, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by month', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var returnData = {
                balance: 0,
                byProduct: [],
                byCategory: [],
                byPuesto: []
            };

            
            result.forEach(function(entry) {            

                returnData.balance = returnData.balance + entry.total;

                if (!entry.puesto) {

                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }
                }

                if (entry.products.length > 1) {
                    entry.products.forEach(function(product) {
                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }

                        /*costo de centro products and categories*/
                        if (!entry.puesto) {

                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {

                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }

                        } else {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        }
                    })
                } else {
                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: entry.products[0].product.category2.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: entry.products[0].product.name }) === -1) {
                            returnData.byProduct.push({
                                name: entry.products[0].product.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    //centro de costo
                    if (!entry.puesto) {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })], { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })], { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                    }
                }
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            console.log('[+] Report::sale success', result);

            res.jsonp(returnData);
        })
}

exports.reporteVentaPorWeek = function(req, res) {

    var enterprise = req.query.e || null;
    var week = req.params.week || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week of the year (2015-12, 2015-13 etc)' });
    }

    Venta.find({ enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by month', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            var returnData = {
                balance: 0,
                byProduct: [],
                byCategory: [],
                byPuesto: []
            };

            result.forEach(function(entry) {

                returnData.balance = returnData.balance + entry.total;

                if (entry.products.length > 1) {
                    entry.products.forEach(function(product) {
                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }
                    })
                } else {
                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: entry.products[0].product.category2.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: entry.products[0].product.name }) === -1) {
                            returnData.byProduct.push({
                                name: entry.products[0].product.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                        }
                    }
                }
                if (!entry.puesto) {
                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }
                    if (entry.products.length > 1) {
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {

                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }

                        })
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }

                    if (entry.products.lenth > 1) {
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        })
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                }
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })
            returnData.byPuesto.forEach(function(puesto) {
                puesto.byProduct = _.sortBy(puesto.byProduct, ['total']).reverse();
                puesto.byCategory = _.sortBy(puesto.byCategory, ['total']).reverse();

                puesto.byProduct.forEach(function(entry) {
                    entry.percent = (entry.total / puesto.total) * 100
                })

                puesto.byCategory.forEach(function(entry) {
                    entry.percent = (entry.total / puesto.total) * 100
                })
            });

            console.log('[+] Report::sale success', result);

            res.jsonp(returnData);
        })
}

exports.reporteCompraPorWeek = function(req, res) {

    var enterprise = req.query.e || null;
    var week = req.params.week || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week of the year (2015-12, 2015-13 etc)' });
    }

    Compra.find({ enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by month', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var returnData = {
                balance: 0,
                byPuesto: [],
                byProduct: [],
                byCategory: []
            };

            result.forEach(function(entry) {

                returnData.balance = returnData.balance + entry.total;

                if (!entry.puesto) {

                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }
                }
                if (entry.products.length > 1) {
                    entry.products.forEach(function(product) {
                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }

                        /*costo de centro products and categories*/
                        if (!entry.puesto) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }

                        } else {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        }
                    })
                } else {
                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: entry.products[0].product.category2.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: entry.products[0].product.name }) === -1) {
                            returnData.byProduct.push({
                                name: entry.products[0].product.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    //centro de costo
                    if (!entry.puesto) {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                }
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            console.log('[+] Report::sale success', result);

            res.jsonp(returnData);
        })
}

exports.reporteVentaPorDay = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.day || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day of the year (2015-12, 2015-251 etc)' });
    }

    Venta.find({ enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by day', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var returnData = {
                balance: 0,
                byProduct: [],
                byCategory: [],
                byPuesto: []
            };

            result.forEach(function(entry) {

                returnData.balance = returnData.balance + entry.total;

                if (entry.products.length > 1) {
                    entry.products.forEach(function(product) {
                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }
                    })
                } else {
                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: entry.products[0].product.category2.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: entry.products[0].product.name }) === -1) {
                            returnData.byProduct.push({
                                name: entry.products[0].product.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                        }
                    }
                }

                if (!entry.puesto) {
                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }

                    if (entry.products.length > 1) {
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        })
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }

                    if (entry.products.length > 1) {
                        entry.products.forEach(function(product) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        })
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                }
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byPuesto.forEach(function(puesto) {
                puesto.byProduct = _.sortBy(puesto.byProduct, ['total']).reverse();
                puesto.byCategory = _.sortBy(puesto.byCategory, ['total']).reverse();

                puesto.byProduct.forEach(function(entry) {
                    entry.percent = (entry.total / puesto.total) * 100
                })

                puesto.byCategory.forEach(function(entry) {
                    entry.percent = (entry.total / puesto.total) * 100
                })
            });

            res.jsonp(returnData);
        })
}

exports.reporteCompraPorDay = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.day || null;
    var category = req.query.category || null;
    var products = req.query.products || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day of the year (2015-12, 2015-251 etc)' });
    }

    Compra.find({ enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' })
        .populate('product')
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Error sale reportes on products by day', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            var returnData = {
                balance: 0,
                byPuesto: [],
                byProduct: [],
                byCategory: []
            };

            result.forEach(function(entry) {
                returnData.balance = returnData.balance + entry.total;

                if (!entry.puesto) {
                    if (_.findIndex(returnData.byPuesto, { from: "others" }) === -1) {
                        returnData.byPuesto.push({ from: "others", total: entry.total, byCategory: [], byProduct: [] });

                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].total += entry.total;
                    }
                } else {
                    if (_.findIndex(returnData.byPuesto, { from: entry.puesto }) === -1) {
                        returnData.byPuesto.push({
                            from: entry.puesto,
                            total: entry.total,
                            byCategory: [],
                            byProduct: []
                        });
                    } else {
                        returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].total += entry.total;
                    }
                }

                if (entry.products.length > 1) {
                    entry.products.forEach(function(product) {
                        if (category) {
                            if (_.findIndex(returnData.byCategory, { name: product.product.category2.name }) === -1) {
                                returnData.byCategory.push({
                                    name: product.product.category2.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                returnData.byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byProduct, { name: product.product.name }) === -1) {
                                returnData.byProduct.push({
                                    name: product.product.name,
                                    total: product.total,
                                    cantidad: product.cantidad
                                })
                            } else {
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                returnData.byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                            }
                        }

                        /*costo de centro products and categories*/
                        if (!entry.puesto) {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        } else {
                            if (category) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                        name: product.product.category2.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: product.product.category2.name })].cantidad += product.cantidad;
                                }
                            }

                            if (products) {
                                if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name }) === -1) {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                        name: product.product.name,
                                        total: product.total,
                                        cantidad: product.cantidad
                                    })
                                } else {
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].total += product.total;
                                    returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: product.product.name })].cantidad += product.cantidad;
                                }
                            }
                        }
                    })
                } else {
                    if (category) {
                        if (_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                            returnData.byCategory.push({
                                name: entry.products[0].product.category2.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                            returnData.byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    if (products) {
                        if (_.findIndex(returnData.byProduct, { name: entry.products[0].product.name }) === -1) {
                            returnData.byProduct.push({
                                name: entry.products[0].product.name,
                                total: entry.products[0].total,
                                cantidad: entry.products[0].cantidad
                            })
                        } else {
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                            returnData.byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                        }
                    }

                    //centro de costo
                    if (!entry.puesto) {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byCategory[_.findIndex(returnData.byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: "others" })].byProduct[_.findIndex(returnData.byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    } else {
                        if (category) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory.push({
                                    name: entry.products[0].product.category2.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byCategory, { name: entry.products[0].product.category2.name })].cantidad += entry.products[0].cantidad;
                            }
                        }

                        if (products) {
                            if (_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name }) === -1) {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct.push({
                                    name: entry.products[0].product.name,
                                    total: entry.products[0].total,
                                    cantidad: entry.products[0].cantidad
                                })
                            } else {
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].total += entry.products[0].total;
                                returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct[_.findIndex(returnData.byPuesto[_.findIndex(returnData.byPuesto, { from: entry.puesto })].byProduct, { name: entry.products[0].product.name })].cantidad += entry.products[0].cantidad;
                            }
                        }
                    }
                }
            })

            returnData.byProduct = _.sortBy(returnData.byProduct, ['total']).reverse();
            returnData.byCategory = _.sortBy(returnData.byCategory, ['total']).reverse();

            returnData.byProduct.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            returnData.byCategory.forEach(function(entry) {
                entry.percent = (entry.total / returnData.balance) * 100
            })

            console.log('[+] Report::sale success', result);

            res.jsonp(returnData);
        })
}

exports.reporteVentaPorYear = function(req, res) {
    var enterprise = req.query.e || null;
    var year = req.params.year || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (year === null) {
        return res.status(400).send({ message: 'You must specify the year (ex: 2015)' });
    }

    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.year': year, estado: 'Finalizada' } },
            //{ $group: { _id: { estado: '$estado', month: '$filterDate.month'}, balance: { $sum: '$total' }}},
            { $group: { _id: { day: '$filterDate.day' }, balance: { $sum: '$total' } } },
            //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
            { $project: { resultado: '$_id', balance: 1, _id: 0 } },
            { $sort: { 'resultado.month': -1 } }
            //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            res.jsonp(result);
        });
};

exports.reporteVentaPorMonth = function(req, res, next) {
    var enterprise = req.query.e || null;
    var month = req.params.month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015-9). Index start at 0' });
    }

    var tareas = [];

    tareas.push(getBalanceMes.bind(null, enterprise, month), getBalancePorSemana.bind(null, enterprise, month), getBalancePorDia.bind(null, enterprise, month));

    async.parallel(tareas, function(err, results) {
        // todo
        // console.log('[+] back from the future:', results);
        if (err) {
            console.log('[-] async error: ', err);
            return next(err);
            //return res.status(500).send({message: err});
        }

        var balanceMes = results[0];
        var balanceSemana = results[1];
        var balanceDia = results[2];

        // console.log('[+] resultados:\nMes: %j,\nSemana: %j\nDia: %j', balanceMes, balanceSemana, balanceDia);
        return res.status(200).send({
            resultado: {
                balanceMes: balanceMes,
                balanceSemana: balanceSemana,
                balanceDia: balanceDia
            }
        });
    });


    function getBalanceMes(enterprise, month, cb) {
        Venta.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
                { $group: { _id: { estado: '$estado', month: '$filterDate.month' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalanceMes::error:', err);
                    return cb(err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    //return err;
                }
                // console.log('[+] Reportes::reporteVentaPorMonth::getBalanceMes::result: ', result);
                return cb(null, result);
                //res.jsonp(result);
                //return result;
            });
    };

    function getBalancePorSemana(enterprise, month, cb) {
        Venta.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
                { $group: { _id: { estado: '$estado', week: '$filterDate.week' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalancePorSemana::error:', err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    return cb(err);
                    //return err;
                }
                // console.log('[+] Reportes::reporteVentaPorMonth::getBalancePorSemana::result: ', result);
                //res.jsonp(result);
                return cb(null, result);
                //return result;
            });
    }

    function getBalancePorDia(enterprise, month, cb) {
        Venta.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
                { $group: { _id: { day: '$filterDate.day' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalancePorDia::error:', err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    return cb(err);
                    //return err;
                }
                console.log('[+] Reportes::reporteVentaPorMonth::getBalancePorDia::result: ', result);
                //res.jsonp(result);
                return cb(null, result);
                //return result;
            });
    };

    // function callback(err, response) {
    // 	if (err) {
    // 		console.log('[-] Error captured on callback: ', err);
    // 		return err;
    // 	}
    // 	console.log('[+] Response on callback:', response);
    // 	return response;
    // }
};

// exports.makeFakeData = function (req, res) {
// 	var faker = require('faker');
//
// 	for (var i = 0; i < 365; i++) {
// 		var date = new Date();
// 		currentDate = date.setDate(date.getDate() + i);
// 		for (var o = 0; o < 60; o++) {
// 			array[i]
// 		}
// 	}
// };

exports.reporteCompraPorQ = function(req, res) {
    var enterprise = req.query.e || null;
    var quarter = req.params.quarter || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (quarter === null) {
        return res.status(400).send({ message: 'You must specify the quarter of the year (2015-1Q, 2015-1Q, 2015-3Q or 2015-4Q)' });
    }

    Compra.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.quarter': quarter, estado: 'Finalizada' } },
            {
                $group: {
                    _id: { estado: '$estado', week: '$filterDate.week' },
                    balance: { $sum: '$total' },
                    tax: { $sum: '$totalTax' }
                }
            },
            //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
            { $project: { resultado: '$_id', balance: 1, _id: 0, tax: 1 } }
            //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            for (var i = 0; i < result.length; i++) {
                result[i]['balance'] = result[i]['balance'] + result[i]['tax'];
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            res.jsonp(result);
        });
};

exports.reporteCompraPorYear = function(req, res) {
    var enterprise = req.query.e || null;
    var year = req.params.year || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (year === null) {
        return res.status(400).send({ message: 'You must specify the year (ex: 2015)' });
    }

    Compra.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.year': year, estado: 'Finalizada' } },
            {
                $group: {
                    _id: { estado: '$estado', month: '$filterDate.month' },
                    balance: { $sum: '$total' },
                    tax: { $sum: '$totalTax' }
                }
            },
            //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
            { $project: { resultado: '$_id', balance: 1, _id: 0, tax: 1 } },
            { $sort: { 'resultado.month': -1 } }
            //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            for (var i = 0; i < result.length; i++) {
                result[i]['balance'] = result[i]['balance'] + result[i]['tax'];
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            res.jsonp(result);
        });
};

exports.reporteCompraPorMonth = function(req, res, next) {
    var enterprise = req.query.e || null;
    var month = req.params.month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015-9). Index start at 0' });
    }

    var tareas = [];

    tareas.push(getBalanceMes.bind(null, enterprise, month), getBalancePorSemana.bind(null, enterprise, month), getBalancePorDia.bind(null, enterprise, month));

    async.parallel(tareas, function(err, results) {
        // todo
        // console.log('[+] back from the future:', results);
        if (err) {
            console.log('[-] async error: ', err);
            return next(err);
            //return res.status(500).send({message: err});
        }

        var balanceMes = results[0];
        var balanceSemana = results[1];
        var balanceDia = results[2];

        // console.log('[+] resultados:\nMes: %j,\nSemana: %j\nDia: %j', balanceMes, balanceSemana, balanceDia);
        return res.status(200).send({
            resultado: {
                balanceMes: balanceMes,
                balanceSemana: balanceSemana,
                balanceDia: balanceDia
            }
        });
    });


    function getBalanceMes(enterprise, month, cb) {
        Compra.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month } },
                { $group: { _id: { estado: '$estado', month: '$filterDate.month' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalanceMes::error:', err);
                    return cb(err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    //return err;
                }
                // console.log('[+] Reportes::reporteVentaPorMonth::getBalanceMes::result: ', result);
                return cb(null, result);
                //res.jsonp(result);
                //return result;
            });
    };

    function getBalancePorSemana(enterprise, month, cb) {
        Compra.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month } },
                { $group: { _id: { estado: '$estado', week: '$filterDate.week' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalancePorSemana::error:', err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    return cb(err);
                    //return err;
                }
                // console.log('[+] Reportes::reporteVentaPorMonth::getBalancePorSemana::result: ', result);
                //res.jsonp(result);
                return cb(null, result);
                //return result;
            });
    }

    function getBalancePorDia(enterprise, month, cb) {
        Compra.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
                { $group: { _id: { day: '$filterDate.day' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalancePorDia::error:', err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    return cb(err);
                    //return err;
                }
                console.log('[+] Reportes::reporteVentaPorMonth::getBalancePorDia::result: ', result);
                //res.jsonp(result);
                return cb(null, result);
                //return result;
            });
    };

    // function callback(err, response) {
    // 	if (err) {
    // 		console.log('[-] Error captured on callback: ', err);
    // 		return err;
    // 	}
    // 	console.log('[+] Response on callback:', response);
    // 	return response;
    // }
};


exports.reporteVentaProductosPorQ = function(req, res) {
    var enterprise = req.query.e || null;
    var quarter = req.params.quarter || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (quarter === null) {
        return res.status(400).send({ message: 'You must specify the quarter of the year (2015-1Q, 2015-1Q, 2015-3Q or 2015-4Q)' });
    }

    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.quarter': quarter, estado: 'Finalizada' } },
            { $group: { _id: { estado: '$estado', week: '$filterDate.week' }, balance: { $sum: '$total' } } },
            //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
            { $project: { resultado: '$_id', balance: 1, _id: 0 } }
            //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            res.jsonp(result);
        });
};

exports.reporteVentaProductosPorYear = function(req, res) {
    var enterprise = req.query.e || null;
    var year = req.params.year || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (year === null) {
        return res.status(400).send({ message: 'You must specify the year (ex: 2015)' });
    }

    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.year': year, estado: 'Finalizada' } },
            { $unwind: '$products' },
            { $match: { 'products.product.esProducto': true } },
            //{ $group: { _id: { estado: '$estado', month: '$filterDate.month'}, balance: { $sum: '$total' }}},
            //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
            {
                $group: {
                    _id: '$products.product.name',
                    values: { $push: { day: '$filterDate.day', cantidad: '$products.cantidad' } }
                }
            },
            //{ $project: { resultado: '$_id', balance: 1, _id: 0}},
            //{ $sort: { 'resultado.month': -1}}
            { $project: { key: '$_id', _id: 0, values: 1 } }
            //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            res.jsonp(result);
        });
};

exports.reporteVentaProductosPorMonth = function(req, res, next) {
    var enterprise = req.query.e || null;
    var month = req.params.month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015-9). Index start at 0' });
    }

    var tareas = [];

    tareas.push(getBalanceMes.bind(null, enterprise, month), getBalancePorSemana.bind(null, enterprise, month), getBalancePorDia.bind(null, enterprise, month));

    async.parallel(tareas, function(err, results) {
        // todo
        // console.log('[+] back from the future:', results);
        if (err) {
            console.log('[-] async error: ', err);
            return next(err);
            //return res.status(500).send({message: err});
        }

        var balanceMes = results[0];
        var balanceSemana = results[1];
        var balanceDia = results[2];

        // console.log('[+] resultados:\nMes: %j,\nSemana: %j\nDia: %j', balanceMes, balanceSemana, balanceDia);
        return res.status(200).send({
            resultado: {
                balanceMes: balanceMes,
                balanceSemana: balanceSemana,
                balanceDia: balanceDia
            }
        });
    });


    function getBalanceMes(enterprise, month, cb) {
        Venta.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month } },
                { $group: { _id: { estado: '$estado', month: '$filterDate.month' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalanceMes::error:', err);
                    return cb(err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    //return err;
                }
                // console.log('[+] Reportes::reporteVentaPorMonth::getBalanceMes::result: ', result);
                return cb(null, result);
                //res.jsonp(result);
                //return result;
            });
    };

    function getBalancePorSemana(enterprise, month, cb) {
        Venta.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month } },
                { $group: { _id: { estado: '$estado', week: '$filterDate.week' }, balance: { $sum: '$total' } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', balance: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalancePorSemana::error:', err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    return cb(err);
                    //return err;
                }
                // console.log('[+] Reportes::reporteVentaPorMonth::getBalancePorSemana::result: ', result);
                //res.jsonp(result);
                return cb(null, result);
                //return result;
            });
    }

    function getBalancePorDia(enterprise, month, cb) {
        Venta.aggregate([
                { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
                { $unwind: '$products' },
                { $match: { 'products.product.esProducto': true } },
                { $group: { _id: { day: '$filterDate.day', product: '$products.product.name', }, cantidad: { $sum: 1 } } },
                //{ $group: { _id: '$estado', balance: { $sum: '$total' }}},
                { $project: { resultado: '$_id', cantidad: 1, _id: 0 } }
                //{ $sort: { 'resultado.month': 1}}
                //{ $group: { _id: '$estado.estado', balance: { $sum: '$balance' }}}

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteVentaPorMonth::getBalancePorDia::error:', err);
                    /*return res.status(400).send({
                    	message: errorHandler.getErrorMessage(err)
                    });*/
                    return cb(err);
                    //return err;
                }
                console.log('[+] Reportes::reporteVentaPorMonth::getBalancePorDia::result: ', result);
                //res.jsonp(result);
                return cb(null, result);
                //return result;
            });
    };

    // function callback(err, response) {
    // 	if (err) {
    // 		console.log('[-] Error captured on callback: ', err);
    // 		return err;
    // 	}
    // 	console.log('[+] Response on callback:', response);
    // 	return response;
    // }
};

exports.reporteVentacategoriasPorYear = function(req, res) {
    var enterprise = req.query.e || null;
    var year = req.params.year || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (year === null) {
        return res.status(400).send({ message: 'You must specify the year (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$category1', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    result.splice(i, 1);
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorDay = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$category1', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: 1 } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};

exports.reporteVentacondiventaPorDay = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;
    console.log("HEREEEEEEEEEEEEEEEEE");

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$condicionVenta', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: 1 } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacomprobantePorDay = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;
    console.log("!!!!!!!");

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$tipoComprobante', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: 1 } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reporteVentacomprobantePorDay::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {

                    if (String(result[i].details[j]['_id']) === result[i].cat_id) {

                        console.log(result[i].details.length, String(result[i].details[j]['_id']), "-!!!----++++##", result[i].cat_id);

                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacondiventaPorDayPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'condicionVenta': '$condicionVenta', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.condicionVenta', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacomprobantePorDayPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'tipoComprobante': '$tipoComprobante', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.tipoComprobante', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorDayPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.day': day, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'category1': '$category1', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.category1', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorMonth = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$category1', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: 1 } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }
            res.jsonp(result);
        });
};

exports.reporteVentacategoriasPorMonthPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'category1': '$category1', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.category1', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }


            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }
            res.jsonp(result);
        });
};


exports.reporteVentacondiventaPorMonth = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$condicionVenta', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: 1 } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }
            res.jsonp(result);
        });
};

exports.reporteVentacondiventaPorMonthPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'condicionVenta': '$condicionVenta', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.condicionVenta', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }


            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }
            res.jsonp(result);
        });
};


exports.reporteVentacomprobantePorMonth = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$tipoComprobante', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: 1 } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }
            res.jsonp(result);
        });
};

exports.reporteVentacomprobantePorMonthPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.month': month, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'tipoComprobante': '$tipoComprobante', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.tipoComprobante', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }


            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }
            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorWeek = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$category1', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Week Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorWeekPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'category1': '$category1', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.category1', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Week Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};

exports.reporteVentacondiventaPorWeek = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$condicionVenta', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Week Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacondiventaPorWeekPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'condicionVenta': '$condicionVenta', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.condicionVenta', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Week Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};


exports.reporteVentacomprobantePorWeek = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$tipoComprobante', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Week Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacomprobantePorWeekPuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;

    //console.log('[+] Reportes::reportePorQ::req.params.quarter::', req.params.quarter);

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week (ex: 2015)' });
    }
    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'filterDate.week': week, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'tipoComprobante': '$tipoComprobante', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.tipoComprobante', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Week Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorRange = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);


    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$category1', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacategoriasPorRangePuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);


    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'category1': '$category1', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.category1', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "categories", localField: "_id", foreignField: "category1", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};

exports.reporteVentacondiventaPorRange = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);


    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$condicionVenta', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacondiventaPorRangePuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);


    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'condicionVenta': '$condicionVenta', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.condicionVenta', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "condicionventas", localField: "_id", foreignField: "condicionVenta", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};


exports.reporteVentacomprobantePorRange = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);


    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            { $group: { _id: '$tipoComprobante', ventas_count: { $sum: 1 }, ventas_amount: { $sum: '$total' } } },
            { $project: { cat_id: '$_id', _id: 0, ventas_count: 1, ventas_amount: 1 } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteVentacomprobantePorRangePuesto = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.start || null;
    var end = req.query.end || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start date (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);


    // '$products.product.category2.name': 'Centro de Costo',
    // ,"products.product.category2.type1":"Centro de Costo"
    Venta.aggregate([
            { $match: { enterprise: enterprise, 'created': { $gte: startDate, $lte: endDate }, estado: 'Finalizada' } },
            { $match: { 'deleted': false } },
            {
                $group: {
                    _id: { 'tipoComprobante': '$tipoComprobante', 'puesto': '$puesto' },
                    ventas_count: { $sum: 1 },
                    ventas_amount: { $sum: '$total' }
                }
            },
            { $project: { cat_id: '$_id.tipoComprobante', _id: 0, ventas_count: 1, ventas_amount: 1, puesto: "$_id.puesto" } },
            { $lookup: { from: "comprobantes", localField: "_id", foreignField: "tipoComprobante", as: "details" } }

        ])
        .exec(function(err, result) {
            if (err) {
                console.log('[-] Reportes::reportePorQ::venta.aggregate::error:', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
            for (var i = 0; i < result.length; i++) {
                for (var j = 0; j < result[i].details.length; j++) {
                    if (result[i].details[j]['_id'] == result[i].cat_id) {
                        result[i]['key'] = result[i].details[j]['name'];
                        // continue;
                    }
                }
                delete result[i].details;
                delete result[i].cat_id;
                if (!result[i].key) {
                    // result.splice( i, 1 );
                    result[i]['key'] = "sin especificar";
                }
            }


            res.jsonp(result);
        });
};
exports.reporteComprascategoriasPorDay = function(req, res) {
    var enterprise = req.query.e || null;
    var day = req.params.Day || null;
    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (day === null) {
        return res.status(400).send({ message: 'You must specify the day (ex: 2015)' });
    }

    Category.find({ type1: "Tipo de Compra" }).exec(function(err, categories) {
        if (err) {
            console.log('Something, went wrong!');
            res.send({ error: "Something, went wrong!" });
        }
        var categories_id = [];
        for (var l = 0; l < categories.length; l++) {
            categories_id.push(categories[l]._id.toString());
        }
        return res.send({ a: categories });
        categories_id.push(null);
        Compra.aggregate([{
                    $match: {
                        enterprise: enterprise,
                        category: { $in: categories_id },
                        'filterDate.day': day,
                        estado: 'Finalizada'
                    }
                },
                { $match: { 'deleted': false } },
                {
                    $group: {
                        _id: '$category',
                        compras_count: { $sum: 1 },
                        compras_amount: { $sum: '$total' },
                        compras_tax: { $sum: '$totalTax' }
                    }
                },
                { $project: { cat_id: '$_id', _id: 0, compras_count: 1, compras_amount: 1, compras_tax: 1 } }

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteCompraPorDay::Compras.aggregate::error:', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
                for (var i = 0; i < result.length; i++) {
                    for (var j = 0; j < categories.length; j++) {
                        if (categories[j]['_id'] == result[i].cat_id) {
                            result[i]['type'] = categories[j]['name'];
                            result[i]['compras_amount'] = categories[j]['compras_amount'];
                        }
                    }
                    delete result[i].details;
                    delete result[i].cat_id;
                    if (!result[i].type) {
                        // result.splice( i, 1 );
                        result[i]['type'] = "sin especificar";
                    }
                }
                res.jsonp(result);
            });
    })

};


exports.reporteComprascategoriasPorWeek = function(req, res) {
    var enterprise = req.query.e || null;
    var week = req.params.Week || null;
    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (week === null) {
        return res.status(400).send({ message: 'You must specify the week ' });
    }

    Category.find({ type1: "Tipo de Compra" }).exec(function(err, categories) {
        if (err) {
            console.log('Something, went wrong!');
            res.send({ error: "Something, went wrong!" });
        }
        var categories_id = [];
        for (var l = 0; l < categories.length; l++) {
            categories_id.push(categories[l]._id.toString());
        }
        categories_id.push(null);

        Compra.aggregate([{
                    $match: {
                        enterprise: enterprise,
                        category: { $in: categories_id },
                        'filterDate.week': week,
                        estado: 'Finalizada'
                    }
                },
                { $match: { 'deleted': false } },
                {
                    $group: {
                        _id: '$category',
                        compras_count: { $sum: 1 },
                        compras_amount: { $sum: '$total' },
                        compras_tax: { $sum: '$totalTax' }
                    }
                },
                { $project: { cat_id: '$_id', _id: 0, compras_count: 1, compras_amount: 1, compras_tax: 1 } }

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteCompraPorDay::Compras.aggregate::error:', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
                for (var i = 0; i < result.length; i++) {
                    for (var j = 0; j < categories.length; j++) {
                        if (categories[j]['_id'] == result[i].cat_id) {
                            result[i]['type'] = categories[j]['name'];
                            result[i]['compras_amount'] = categories[j]['compras_amount'];
                        }
                    }
                    delete result[i].details;
                    delete result[i].cat_id;
                    if (!result[i].type) {
                        // result.splice( i, 1 );
                        result[i]['type'] = "sin especificar";
                    }
                }
                res.jsonp(result);
            });
    })

};

exports.reporteComprascategoriasPorMonth = function(req, res) {
    var enterprise = req.query.e || null;
    var month = req.params.Month || null;
    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (month === null) {
        return res.status(400).send({ message: 'You must specify the month' });
    }

    Category.find({ type1: "Tipo de Compra" }).exec(function(err, categories) {
        if (err) {
            console.log('Something, went wrong!');
            res.send({ error: "Something, went wrong!" });
        }
        var categories_id = [];
        for (var l = 0; l < categories.length; l++) {
            categories_id.push(categories[l]._id.toString());
        }

        console.log(categories);

        categories_id.push(null);
        Compra.aggregate([{
                    $match: {
                        enterprise: enterprise,
                        category: { $in: categories_id },
                        'filterDate.month': month,
                        estado: 'Finalizada'
                    }
                },
                { $match: { 'deleted': false } },
                {
                    $group: {
                        _id: '$category',
                        compras_count: { $sum: 1 },
                        compras_amount: { $sum: '$total' },
                        compras_tax: { $sum: '$totalTax' }
                    }
                },
                { $project: { cat_id: '$_id', _id: 0, compras_count: 1, compras_amount: 1, compras_tax: 1 } }

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteCompraPorDay::Compras.aggregate::error:', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
                for (var i = 0; i < result.length; i++) {
                    for (var j = 0; j < categories.length; j++) {
                        if (categories[j]['_id'] == result[i].cat_id) {
                            result[i]['type'] = categories[j]['name'];
                            result[i]['compras_amount'] = categories[j]['compras_amount'];
                        }
                    }
                    delete result[i].details;
                    delete result[i].cat_id;
                    if (!result[i].type) {
                        // result.splice( i, 1 );
                        result[i]['type'] = "sin especificar";
                    }
                }

                console.log(result)
                res.jsonp(result);
            });
    })

};

exports.reporteComprascategoriasPorRange = function(req, res) {
    var enterprise = req.query.e || null;
    var start = req.query.Start || null;
    var end = req.query.End || null;

    if (enterprise === null) {
        return res.status(400).send({ message: 'You must specify the enterprise first' });
    }

    if (start === null) {
        return res.status(400).send({ message: 'You must specify the start (2015-10, 2015-11 etc)' });
    }

    if (end === null) {
        return res.status(400).send({ message: 'You must specify the end date (2015-10, 2015-11 etc)' });
    }

    var startyear = start.split('-')[0];
    var startday = start.split('-')[1];

    var startdate = new Date(startyear, 0);
    var startDate = new Date(startdate.setDate(startday))
    startDate.setHours(0, 0, 0, 0);

    var endyear = end.split('-')[0];
    var endday = end.split('-')[1];

    var enddate = new Date(endyear, 0);
    var endDate = new Date(enddate.setDate(endday))
    endDate.setHours(23, 59, 59, 999);

    Category.find({ type1: "Tipo de Compra" }).exec(function(err, categories) {
        if (err) {
            console.log('Something, went wrong!');
            res.send({ error: "Something, went wrong!" });
        }
        var categories_id = [];
        for (var l = 0; l < categories.length; l++) {
            categories_id.push(categories[l]._id.toString());
        }
        categories_id.push(null);
        Compra.aggregate([{
                    $match: {
                        enterprise: enterprise,
                        category: { $in: categories_id },
                        'fechaRecepcion': { $gte: startDate, $lte: endDate },
                        estado: 'Finalizada'
                    }
                },
                { $match: { 'deleted': false } },
                {
                    $group: {
                        _id: '$category',
                        compras_count: { $sum: 1 },
                        compras_amount: { $sum: '$total' },
                        compras_tax: { $sum: '$totalTax' }
                    }
                },
                { $project: { cat_id: '$_id', _id: 0, compras_count: 1, compras_amount: 1, compras_tax: 1 } }

            ])
            .exec(function(err, result) {
                if (err) {
                    console.log('[-] Reportes::reporteCompraPorDay::Compras.aggregate::error:', err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
                console.log('[+] Reportes::reportePorQ::venta.aggregate::result: ', result);
                for (var i = 0; i < result.length; i++) {
                    for (var j = 0; j < categories.length; j++) {
                        if (categories[j]['_id'] == result[i].cat_id) {
                            result[i]['type'] = categories[j]['name'];
                            result[i]['compras_amount'] = categories[j]['compras_amount'];
                        }
                    }
                    delete result[i].details;
                    delete result[i].cat_id;
                    if (!result[i].type) {
                        // result.splice( i, 1 );
                        result[i]['type'] = "sin especificar";
                    }
                }
                res.jsonp(result);
            });
    })

};