'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Remuneracione = mongoose.model('Remuneracione'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var fall = require('async-waterfall');

exports.create = function (req, res) {
    var remuneracione = new Remuneracione(req.body);
    remuneracione.user = req.user;
    remuneracione.created = new Date();

    remuneracione.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(remuneracione);
        }
    });
};

exports.read = function (req, res) {
    console.log(req.remuneracione);
    res.jsonp(req.remuneracione);
};

exports.update = function (req, res) {

    var remuneracione = req.remuneracione;
    remuneracione = _.extend(remuneracione, req.body);
    remuneracione.updated = new Date();
    remuneracione.save(function (err) {
        if (err) {
            console.log('Error al actualizar remuneracioneo:', err);
        } else {
            res.jsonp(remuneracione);
        }
    });
};

exports.delete = function (req, res) {
    var remuneracione = req.remuneracione;
    console.log("remuneracione=================");
    console.log(remuneracione);
    
    remuneracione.deleted = true;
    remuneracione.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(remuneracione);
        }
    });
};

exports.list = function (req, res) {
    var enterprise = req.query.e || null;

    if (enterprise !== null) {
        Remuneracione.find({enterprise: enterprise}).sort('-created').populate('user', 'displayName').populate('enterprise', 'name').populate('category').exec(function (err, remuneraciones) {
            if (err) {
                console.log("[E] error buscando remuneraciones: ", err);
                return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {
                res.jsonp(remuneraciones);
            }
        });
    } else {
        Remuneracione.find().sort('-created').populate('user', 'displayName').populate('enterprise', 'name').populate('category').populate('remuneracione', 'name').exec(function (err, remuneraciones) {
            if (err) {
                return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {
                res.jsonp(remuneraciones);
            }
        });
    }
};

exports.remuneracioneByID = function (req, res, next, id) {
    Remuneracione.findById(id).populate('user', 'displayName').populate('enterprise', 'name')
        .populate('category').populate('remuneracione', 'name').exec(function (err, remuneracione) {
        if (err)
            return next(err);
        if (!remuneracione)
            return next(new Error('Failed to load remuneracione ' + id));
        req.remuneracione = remuneracione;
        next();
    });
};
