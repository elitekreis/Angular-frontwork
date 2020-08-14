'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Caja = mongoose.model('Caja'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fall = require('async-waterfall');

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
    var caja = new Caja(req.body);
    caja.user = req.user;

    caja.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(caja);
        }
    });
};

/**
 * Show the current caja
 */
exports.read = function(req, res) {
    res.jsonp(req.caja);
};

/**
 * Update a caja
 */
exports.update = function(req, res) {
    var caja = req.caja;  

    caja = _.extend(caja, req.body);

    caja.save(function(err) {
        console.log(err);
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            caja.populate('puestos', function(err, populated) {
                if (err) return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                })

                var tasks = [];
                var arrayOfUsers = [];

                populated.puestos.forEach(function(entry, entrykey) {
                  var task = function(callback) {
                    User.find({ puesto: entry._id }).exec(function(err, foundUsers) {
                      if (err) return callback(err);

                      if (foundUsers) {
                        arrayOfUsers.push({ entrykey: entrykey, users: foundUsers })
                      }
                      callback()
                    })
                  }
                  tasks.push(task);
                })

                fall(tasks, function(err) {
                    if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

                    var temp = JSON.parse(JSON.stringify(populated))

                    arrayOfUsers.forEach(function(entry) {
                        temp.puestos[entry.entrykey].users = entry.users;
                    })

                    res.jsonp(temp);
                })
            })
        }
    });
};

/**
 * Delete an caja
 */
exports.delete = function(req, res) {
    var caja = req.caja;
    caja.deleted = true;
    caja.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(caja);
        }
    });
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
    var enterprise = req.query.e || null;
    if (enterprise !== null) {
        Caja.find({ enterprise: enterprise })
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .populate('puestos')
            .exec(function(err, cajas) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var tasks = [];

                    var arrayOfUsers = [];
                      
                    cajas.forEach(function(entry, entrykey) {
                        entry.puestos.forEach(function(puesto, puestokey) {
                            var task = function(callback) {

                                User.find({ puesto: puesto._id }).exec(function(err, foundUsers) {
                                    if (err) return callback(err);

                                    if (foundUsers) {
                                        arrayOfUsers.push({ entrykey: entrykey, puestokey: puestokey, users: foundUsers });
                                    }
                                    callback();
                                })
                            };

                            tasks.push(task);
                        })
                    });

                    fall(tasks, function(err) {
                        if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

                        var temp = JSON.parse(JSON.stringify(cajas));

                        arrayOfUsers.forEach(function(entry) {
                            temp[entry.entrykey].puestos[entry.puestokey].users = entry.users;
                        });

                     
                        res.jsonp(temp);
                        
                    })
                }
            });
    } else {
        Caja.find()
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .exec(function(err, cajas) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(cajas);
                }
            });
    }
};
exports.updateTotal = function(req, res) {
    var venta = req.body;
    console.log("##$$$$%$%$%", venta);
    Caja.findOneAndUpdate({ _id: venta.caja }, { $inc: { total: caja.total + venta.total } })
        .exec(function(err, caja) {
            console.log(caja)
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(caja);
            }
        });
};
/**
 * Comprobante middleware
 */
exports.cajaByID = function(req, res, next, id) {
    Caja.findById(id)
    .populate('user', 'displayName')
    .populate('enterprise', 'name')
    .exec(function(err, caja) {
        if (err) return next(err);
        if (!caja) return next(new Error('Failed to load caja ' + id));
        req.caja = caja;
        next();
    });
};