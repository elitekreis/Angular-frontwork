'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    Puesto = mongoose.model('Puesto'),
    User = mongoose.model('User'),
    Empleado = mongoose.model('Empleado');

/**
 * Update user details
 */

exports.update = function (req, res) {
    var user = req.user;

    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.enterprise = user.enterprise._id.toString();

    console.log(user);
    console.log(req.body);

    librePuesto(user);
    ocuparPuesto(user);
    updateEmpleado(user);

    user.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp(user);
        }
    });
};

function librePuesto (user){
    if(user.oldPuesto) {
        puestoConId(user.oldPuesto._id, function(puesto){
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

function ocuparPuesto (user){
    puestoConId(user.puesto, function(puesto){
        puesto.personal = user._id.toString();
        puesto.estado = 'Ocupado';
        puesto.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('puesto actualizado ok');
            }
        });
    });
}

function updateEmpleado(user) {
    Empleado
        .findOne({userLogin: user._id})
        .exec(function(err, empleado) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                empleado.puesto = user.puesto;
                empleado.sueldo = user.sueldo;
                empleado.deleted = user.deleted;
                empleado.save(function (saveError) {
                    if (saveError) {
                        console.log(saveError);
                    }
                });
            }
        });
}


/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
    var id = req.body._id;

    User.findOne({_id: id})
        .populate('puesto')
        .populate('puesto.interaccion')
        .populate('centroDeCosto')
        .populate('enterprise')
        .exec(function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                var ext = req.files.file.name.split(".");
                fs.writeFile('modules/users/client/img/profile/uploads/' + user._id + "." + ext[ext.length - 1], req.files.file.buffer, function (uploadError) {
                    if (uploadError) {
                        return res.status(400).send({
                            message: 'Error occurred while uploading profile picture'
                        });
                    } else {
                        user.profileImageURL = '/modules/users/img/profile/uploads/' + user._id + "." + ext[ext.length - 1];

                        user.save(function (saveError) {
                            if (saveError) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(saveError)
                                });
                            } else {
                                res.json(user);
                            }
                        });
                    }
                });
            }
        });
};

/**
 * Send User
 */
exports.me = function (req, res) {
    res.json(req.user || null);
};


/**
 * List of Users
 */
exports.list = function (req, res) {
    var enterprise = req.query.e || null;
    if (enterprise !== null) {
        User.find({enterprise: enterprise})
            .sort('-created')
            .populate('puesto')
            .populate('enterprise')
            .exec(function (err, users) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(users);
                }
            });
    } else {
        User.find()
            .sort('-created')
            .populate('puesto', 'name')
            .populate('enterprise')
            .exec(function (err, users) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(users);
                }
            });
    }
};

exports.changeStatus = function (req, res) {
    var id = req.query.userId;
    var estado = req.query.estado;
    User.findOne({_id: id})
        .exec(function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (user !== null) {
                    if (estado !== undefined) {
                        user.status = estado;
                    }
                    user.save(function () {
                        return res.status(200).send([{status: 'ok'}]);
                    });
                }
            }
        });
};

exports.changePuesto = function (req, res) {
    var id = req.query.userId;
    var puesto = req.query.puestoId;
    var rol = req.query.rol;
    var obs = req.query.obs;
    User.findOne({_id: id})
        .exec(function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (puesto !== null) {
                    if (puesto !== undefined) {
                        user.puesto = puesto;
                        //*****Actualiza el puesto
                        //*****DA UN ERROR Q NO SE Q ES 'Cannot read property 'options' of undefined'
                        // puestoConId(puesto, function(puesto){
                        // 	// puesto.personal = user._id;
                        // 	// console.log(puesto, 'puesto');
                        // 	puesto.save(function(err) {
                        // 		if (err) {
                        // 			console.log("puesto guardado error", err);
                        // 			return res.status(400).send({
                        // 				message: errorHandler.getErrorMessage(err)
                        // 			});
                        // 		} else {
                        // 			// console.log("puesto guardado");
                        // 		};
                        // 	});
                        // });
                    }

                    if (rol !== undefined || rol !== null) {
                        user.roles = [rol];
                    }
                    if (obs !== undefined || obs !== null) {
                        user.observaciones = obs;
                    }
                    user.save(function (err) {
                        //console.log('[+] el user antes de salvar es: ', user);
                        if (err) {
                            console.log('[-] error al guardar:', err);
                        }
                        return res.status(200).send([{status: 'ok'}]);
                    });
                }
            }
        });
};

exports.findUserById = function (req, res) {
    var id = req.query.userId;
    User.findOne({_id: id})
        .populate('puesto')
        .populate('puesto.interaccion')
        .populate('centroDeCosto')
        .populate('enterprise')
        .exec(function (err, user) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
            else {
                res.json(user);
            }
        });
};

//retorna un pusto con id
//retorna un pusto con id
function puestoConId(id, callback){
    Puesto.findById(id)
        .populate('user', 'displayName')
        .populate('procesos', 'name')
        .populate('parent', 'name')
        .populate('proceso', 'name')
        .populate('personal', 'displayName')
        .populate('enterprise', 'name')
        .populate('area', 'name')
        .populate('puesto', 'name')
        .populate('interaccion', 'name')
        .populate('procedimientos', 'name description')
        .exec(function(err, puesto) {
            if (!err) {
                //console.log('[ok] -> ', puesto);
                return callback(puesto);
            } else {
                console.log("[err] ->", err);
            }
        });
}