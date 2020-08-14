'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Puesto = mongoose.model('Puesto'),
    User = mongoose.model('User'),
    Empleado = mongoose.model('Empleado'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Puesto
 */
exports.create = function (req, res) {
    var puesto = new Puesto(req.body);
    puesto.user = req.user;
    puesto.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(puesto);
        }
    });
};

/**
 * Show the current Puesto
 */
exports.read = function (req, res) {
    res.jsonp(req.puesto);
};

/**
 * Update a Puesto
 */
exports.update = function (req, res) {
    var puesto = req.puesto;
    puesto = _.extend(puesto, req.body);

    if(puesto.changeEstado) {
        puesto.estado = "Ocupado";
    }

    if (puesto.personal !== undefined && puesto.personal) {
        //!*****Actualiza el puesto del usuario
        userConId(puesto.personal, function (user) {
            if (user !== undefined && user !== null) {
                librePuesto(user);
                user.puesto = puesto._id.toString();
                updateEmpleado(user);

                user.save(function (err) {
                    if (err) {
                        console.log("user guardado error" + err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                });
            }
        });
    }

    if(puesto.personal) {
        Puesto.update({"personal": req.puesto.personal}, {$unset: {"personal": 1}, $set: {"estado": "Libre"}}, {multi: true}, callback);
    } else {
        puesto.estado = 'Libre';
        puesto.personal = undefined;
    }

    function callback(err, numAffected) {
        console.log(numAffected);
    }

    puesto.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(puesto);
        }
    });
};

function librePuesto(user){
    if(user.puesto) {
        puestoConId(user.puesto._id, function(puesto){
            delete puesto.personal;
            puesto.estado = 'Libre';
            puesto.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('puesto actualizado ok');
                }
            });
        });
    }
}

function updateEmpleado(user) {
    Empleado
        .findOne({userLogin: user._id})
        .exec(function(err, empleado) {
            if(empleado) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    empleado.puesto = user.puesto;
                    empleado.sueldo = user.sueldo;
                    empleado.save(function (saveError) {
                        if (saveError) {
                            console.log(saveError);
                        }
                    });
                }
            }
        });
}

exports.editarEstado = function (req, res) {
    var puestoId = req.query.puesto;
    var estado = req.query.estado;
    // console.log('editando estado puestooooo');
    // console.log('puesto', puesto);
    puestoConId(puestoId, function (puesto) {
        // console.log('puestooo:', puesto);
        // puesto.estado = estado;
        // if((estado=='Libre')||(estado=='Sin especificar')){
        // 	delete puesto['personal'];
        // }
        puesto.save(function (err) {
            if (err) {
                console.log('error', err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp(puesto);
            }
        });
    });
};

/**
 * Delete an Puesto
 */
exports.delete = function (req, res) {
    var puesto = req.puesto;
    puesto.deleted = true;
    puesto.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(puesto);
        }
    });
};

/**
 * List of Puestos
 */
exports.list = function (req, res) {
    var enterprise = req.query.e || null;
    if (enterprise !== null) {
        Puesto.find({enterprise: enterprise})
            .sort('-created')
            .populate('user', 'displayName')
            .populate('procesos', 'name')
            .populate('parent', 'name')
            .populate('proceso', 'name')
            .populate('personal', 'displayName')
            .populate('enterprise', 'name')
            .populate('area', 'name')
            .populate('interaccion', 'name')
            .populate('procedimientos', 'name description')
            .exec(function (err, puestos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(puestos);
                }
            });
    }
    else {
        Puesto.find()
            .sort('-created')
            .populate('user', 'displayName')
            .populate('procesos', 'name')
            .populate('parent', 'name')
            .populate('proceso', 'name')
            .populate('enterprise', 'name')
            .populate('area', 'name')
            .populate('interaccion', 'name')
            .populate('sub', 'name')
            .populate('procedimientos', 'name description')
            .exec(function (err, puestos) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(puestos);
                }
            });
    }
};
/**
 * Puesto middleware
 */
exports.puestoByID = function (req, res, next, id) {
    Puesto.findById(id)
        .populate('user', 'displayName')
        .populate('procesos', 'name')
        .populate('parent', 'name')
        .populate('proceso', 'name')
        .populate('enterprise', 'name')
        .populate('area', 'name')
        .populate('personal', 'displayName')
        .populate('interaccion', 'name')
        .populate('sub', 'name')
        .populate('procedimientos', 'name description')
        .exec(function (err, puesto) {
            if (err) return next(err);
            if (!puesto) return next(new Error('Failed to load Puesto ' + id));
            req.puesto = puesto;
            next();
        });
};

exports.puestoByAreaId = function (req, res) {
    var area = req.query.areaId;
    Puesto.find({area: area})
        .populate('interaccion')
        .populate('procesos')
        // .populate('puesto.interaccion')
        .populate('enterprise')
        .populate('sub', 'name')
        .exec(function (err, puestos) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(puestos);
            }
        });
};

// retorna user con id
function userConId(id, callback) {
    User.findById(id)
        .populate('puesto')
        .populate('puesto.interaccion')
        .populate('centroDeCosto')
        .populate('enterprise')
        .exec(function (err, user) {
            if (!err) {
                return callback(user);
            } else {
                console.log("error");
            }
        });
};

//retorna un puesto con id
function puestoConId(id, callback) {
    Puesto.findById(id)
        .exec(function (err, puesto) {
            if (err) {
                console.log("error");
            } else {
                return callback(puesto);
            }
        });
};
