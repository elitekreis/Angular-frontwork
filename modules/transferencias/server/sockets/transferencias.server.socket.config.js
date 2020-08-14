'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Transferencia = mongoose.model('Transferencia'),
    Caja = mongoose.model('Caja');

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
    socket.on('transferencia.create', function(message) {
        createTransferencia(message, function(result) {
            if (result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('sucursal.update', result.data);
            }
        });
    });

    function createTransferencia(message, callback) {
        var transferencia = new Transferencia(message);
        transferencia.user = socket.request.user;

        transferencia.save(function(err) {
            if (err) {
                return callback({ status: 'error', message: errorHandler.getErrorMessage(err) });
            } else {
                actualizarCajaOrigen(transferencia);
                actualizarCajaDestino(transferencia);
                callback({ status: 'success', data: message });
            }
        });
    };

    function actualizarCajaOrigen(t) {
        // cajaConId(t.cajaO, function(c){
        Caja.findById(t.cajaO)
            .exec(function(err, c) {
                c.efectivo = c.efectivo - t.montoE;
                c.dolares = c.dolares - t.montoD
                c.cheques = c.cheques - t.montoC;
                c.debito = c.debito - t.montoTD;
                c.credito = c.credito - t.montoTC;


                c.total = c.cheques + c.efectivo + c.debito + c.credito + c.dolares;
                c.save(function(err) {
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log('Caja transferencia origen actualizada ok');
                    }
                });
            })
    };

    function actualizarCajaDestino(t) {
        // cajaConId(t.cajaD, function(c){
        Caja.findById(t.cajaD)
            .exec(function(err, c) {
                c.efectivo = c.efectivo + t.montoE;
                c.dolares = c.dolares + t.montoD
                c.cheques = c.cheques + t.montoC;
                c.debito = c.debito + t.montoTD;
                c.credito = c.credito + t.montoTC;
                c.total = c.cheques + c.efectivo + c.debito + c.credito + c.dolares;
                c.save(function(err) {
                    if (err) {
                        console.log(err, 'error');
                    } else {
                        console.log('Caja transferencia destino actualizada ok');
                    }
                });
            })
    };


    /*function getPosts(callback) {
        var enterprise = socket.request.user.enterprise._id;
        if (enterprise !== undefined) {
            Post.find({enterprise: enterprise})
            .sort('-created')
            .populate('user')
            .exec(function(err, posts) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: posts});
                }
            });
        } else {
            Post.find()
            .sort('-created')
            .populate('user')
            .exec(function(err, posts) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: posts});
                }
            });
        };

    };*/

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
};