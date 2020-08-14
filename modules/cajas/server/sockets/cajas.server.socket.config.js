'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  	Caja = mongoose.model('Caja');

// Create the chat configuration
module.exports = function(io, socket) {

    //get enterprises and create socket namespaces
    getEnterprises(function(result){
        if(result.status !== 'success') {
            console.log('Error al recibir listado de empresas para el socket: ', result.message);
        } else {
            //console.log('data: ', JSON.stringify(result.data));
            if (result.data.length > 0) {
                var enterprises = result.data;
                var namespaces = {};

                enterprises.forEach(function(enterprise){
                    namespaces[enterprise.name] = io.of('/' + enterprise.name);
                });

                //console.log('namespace:', namespaces);
            } else {
                console.log('Error, no se han creado empresas?');
            }
        }
    });



    // get list of posts for enterpise when message is received
    socket.on('caja.create', function(message) {
        createCaja(message, function(result){
            if(result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('sucursal.update', result.data);
            }
        });
    });

    function createCaja(message, callback) {
      var caja = new Caja(message);
      caja.user = socket.request.user;

      caja.save(function(err) {
        if (err) {
          return callback({status: 'error', message: errorHandler.getErrorMessage(err)});
        } else {
          callback({status: 'success', data: message});
        }
      });
    };

    function getEnterprises(callback) {
        Enterprise.find()
            .sort('-created')
            .exec(function(err, enterprises) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: enterprises});
                }
            });
    }
};
