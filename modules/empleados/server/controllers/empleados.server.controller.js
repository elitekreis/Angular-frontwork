'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Empleado = mongoose.model('Empleado'),
    Puesto = mongoose.model('Puesto'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    _ = require('lodash');

/**
 * Create a Empleado
 */
exports.create = function (req, res) {
    var empleado = new Empleado(req.body);
    empleado.user = req.user;

    User.update({"puesto": empleado.puesto}, {$unset: {"puesto": 1}}, {multi: true}, callback)
    User.update({"puesto": ""}, {$unset: {"puesto": 1}}, {multi: true}, callback)
    Empleado.update({"puesto": empleado.puesto}, {$unset: {"puesto": 1}}, {multi: true}, callback)

    empleado.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(empleado);
        }
    });
};

/**
 * Show the current Empleado
 */
exports.read = function (req, res) {
    // convert mongoose document to JSON
    var empleado = req.empleado ? req.empleado.toJSON() : {};

    // Add a custom field to the Article, for determining if the current User is the "owner".
    // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
    empleado.isCurrentUserOwner = req.user && empleado.user && empleado.user._id.toString() === req.user._id.toString() ? true : false;

    res.jsonp(empleado);
};

/**
 * Update a Empleado
 */
exports.update = function (req, res) {
    console.log("+++++++++++++++++ empleados")
    var empleado = req.empleado;

    empleado = _.extend(empleado, req.body);

    var id = empleado.userLogin._id;
    User.update({"puesto": empleado.puesto}, {$unset: {"puesto": 1}}, {multi: true}, callback)
    User.update({"puesto": ""}, {$unset: {"puesto": 1}}, {multi: true}, callback)
    Empleado.update({"puesto": empleado.puesto}, {$unset: {"puesto": 1}}, {multi: true}, callback)

    function callback(err, numAffected) {
        console.log(numAffected);
    }

    userById(id, empleado, function (u) {
        u.save(function (err) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                empleado.save(function (err) {
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp(empleado);
                    }
                });
            }
        });
    });
};

function userById(u, e, callback) {
    User.findById(u)

        .exec(function (err, user) {

            user.firstName = e.userLogin.firstName;
            if (e.userLogin.roles) {
                user.roles = e.userLogin.roles;
            }
            user.lastName = e.userLogin.lastName;
            user.email = e.userLogin.email;
            user.puesto = e.puesto;
            if (!err) {
                return callback(user);
            } else {
                console.log("error");
            }
        });
};

/**
 * Delete an Empleado
 */
exports.delete = function (req, res) {
    var empleado = req.empleado;
    empleado.deleted = true;

    empleado.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(empleado);
        }
    });
};

exports.findByCentroDeCosto = function (req, res) {
    var enterprise = req.body.enterprise;
    var centrodecosto = req.body.centrodecosto;

    Empleado.find({enterprise: enterprise, deleted: false})
        .sort('-created')
        .populate('user', 'displayName')
        .populate('userLogin')
        .populate('puesto')
        .exec(function (err, empleados) {

            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var returnEmpleados = [];
                for (var i = 0; i < empleados.length; i++) {
                    if (empleados[i].puesto && empleados[i].puesto.centroDeCosto == centrodecosto) {
                        returnEmpleados.push(empleados[i]);
                    }
                }

                res.jsonp(returnEmpleados);
            }
        });
};


exports.findByUser = function (req, res) {
    var enterprise = req.body.enterprise;
    var user = req.body.user;

    Empleado.find({userLogin: user, deleted: false})
        .sort('-created')
        .populate('user', 'displayName')
        .populate('userLogin')
        .populate('puesto')
        .exec(function (err, empleado) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(empleado);
            }
        });
};

/**
 * List of Empleados
 */
exports.list = function (req, res) {
    var enterprise = req.query.e || null;

    if (enterprise !== null) {
        Empleado.find({enterprise: enterprise})
            .sort('-created')
            .populate('user', 'displayName')
            .populate('userLogin')
            .populate('puesto', 'name')
            .exec(function (err, empleados) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(empleados);
                }
            });
    }
    else {
        Empleado.find()
            .sort('-created')
            .populate('user', 'displayName')
            .populate('userLogin')
            .exec(function (err, empleados) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(empleados);
                }
            });
    }
};

/**
 * Empleado middleware
 */
exports.empleadoByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Empleado is invalid'
        });
    }

    Empleado.findById(id)
        .populate('user', 'displayName')
        .populate('userLogin')
        .populate('enterprise', 'name')
        .populate('puesto', 'name')
        .exec(function (err, empleado) {

            if (err) {
                return next(err);
            } else if (!empleado) {
                return res.status(404).send({
                    message: 'No Empleado with that identifier has been found'
                });
            }
            req.empleado = empleado;
            next();
        });
};
