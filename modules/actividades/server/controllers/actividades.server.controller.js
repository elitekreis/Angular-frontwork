'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Actividad = mongoose.model('Actividad'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fall = require('async-waterfall');

exports.create = function (req, res) {
    var actividad = new Actividad(req.body);
    actividad.user = req.user;
    actividad.created = new Date();

    actividad.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(actividad);
        }
    });
};

exports.read = function (req, res) {
    res.jsonp(req.actividad);
};

exports.update = function (req, res) {

    var actividad = req.actividad;
    actividad = _.extend(actividad, req.body);
    actividad.updated = new Date();
    actividad.save(function (err) {
        if (err) {
            console.log('Error al actualizar actividad:', err);
        } else {
            res.jsonp(actividad);
        }
    });
};

exports.delete = function (req, res) {
    var actividad = req.actividad;
    actividad.deleted = true;
    actividad.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(actividad);
        }
    });
};

exports.list = function (req, res) {
    var enterprise = req.query.e || null;
    if (enterprise !== null) {
        Actividad.find({enterprise: enterprise})
            .sort('-created')
            .populate('empleado')
            .populate('enterprise')
            .exec(function (err, actividades) {
                if (err) {
                    console.log("[E] error buscando actividades: ", err);
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {
                    res.jsonp(actividades);
                }
            });
    } else {
        Actividad.find()
            .sort('-created')
            .populate('empleado')
            .populate('enterprise')
            .exec(function (err, actividades) {
                if (err) {
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {
                    res.jsonp(actividades);
                }
            });
    }
};

exports.listByUser = function (req, res) {
    var empleadoId = req.body.empleadoId;
    var year = req.body.year || null;
    var month = req.body.month || null;

    if (year !== null || month !== null) {
        var startDate = moment().startOf('month');
        var endDate = startDate.clone().endOf('month');

        if (month && year) {
            startDate = moment().year(year).month(month).startOf("month");
            endDate = startDate.clone().endOf('month');
        } else if (month) {
            startDate = moment().month(month).startOf("month");
            endDate = startDate.clone().endOf('month');
        } else if (year) {
            startDate = moment().year(year).startOf("year");
            endDate = startDate.clone().endOf('year');
        }

        Actividad.find({
            empleado: empleadoId,
            deleted: false,
            created: {
                $gt: startDate,
                $lt: endDate
            }
        })
            .sort('-created')
            .populate('empleado')
            .populate('enterprise')
            .exec(function (err, actividades) {
                if (err) {
                    console.log("[E] error buscando actividades: ", err);
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {
                    console.log(actividades);
                    res.jsonp(actividades);
                }
            });
    } else {
        Actividad.find({empleado: empleadoId})
            .sort('-created')
            .populate('empleado')
            .populate('enterprise')
            .exec(function (err, actividades) {
                if (err) {
                    console.log("[E] error buscando actividades: ", err);
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {
                    console.log(actividades);
                    res.jsonp(actividades);
                }
            });
    }
};

exports.actividadByID = function (req, res, next, id) {
    Actividad.findById(id)
        .populate('enterprise', 'name')
        .populate('empleado')
        .exec(function (err, actividad) {
            if (err)
                return next(err);
            if (!actividad)
                return next(new Error('Failed to load actividad ' + id));
            req.actividad = actividad;
            next();
        });
};
