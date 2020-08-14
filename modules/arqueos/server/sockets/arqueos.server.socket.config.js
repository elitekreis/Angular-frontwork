'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  	Arqueo = mongoose.model('Arqueo'),
  	Caja = mongoose.model('Caja');

// Create the chat configuration
module.exports = function(io, socket) {

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
    socket.on('arqueo.create', function(message) {
        createArqueo(message, function(result){
            if(result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('sucursal.update', result.data);
            }
        });
    });

    function createArqueo(message, callback) {
      	var arqueo = new Arqueo(message);
      	arqueo.user = socket.request.user;

      	arqueo.save(function(err) {
        	if (err) {
          		return callback({status: 'error', message: errorHandler.getErrorMessage(err)});
        	}
        	else{
          		actualizarCaja(arqueo);
          		callback({status: 'success', data: message});
        	}
      	});
    };

    function actualizarCaja (arqueo){
	// cajaConId(arqueo.caja, function(c){
	Caja.findById(arqueo.caja)
		.exec(function(err, c) {
			c.total = arqueo.total;
			c.efectivo = arqueo.efectivo;
			c.cheques = arqueo.cheques;
			c.credito = arqueo.credito;
			c.debito = arqueo.debito;
			c.dolares = arqueo.dolares;
			c.save(function(err) {
				if (err) {
					console.log(err, 'error actualizar caja');
				} else {
					console.log('Caja arqueo actualizada ok');
				}
			});
		})
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
