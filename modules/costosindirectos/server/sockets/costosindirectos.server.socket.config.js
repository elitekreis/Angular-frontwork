'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    ObjectId = mongoose.Types.ObjectId,
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  	Pago = mongoose.model('Pago'),
  	Servicio = mongoose.model('Servicio'),
    costosindirectos = mongoose.model('Costosindirecto');
    //Costosindirecto = mongoose.model('Costosindirecto');

// Create the chat configuration
module.exports = function(io, socket) {
    socket.on('costosindirectos.update', function(total) {
/*        updateCostoIndirectos(message, function(result){
            if(result.status !== 'success') {
                console.log('Error al escribir en db: ', result.message);
            } else {
                io.emit('costosindirecto.update', result.data);
            }
        });
*/    });



    function updateServios(t){
        // cajaConId(t.cajaD, function(c){
        Servicio.findById(t.servicios)
        .exec(function(err, c) {
            c.pagoAcumulados = c.pagoAcumulados + t.montoE;
            c.save(function(err) {
                if (err) {
                    console.log(err, 'error');
                } else {
                    console.log('pago ok');
                }
            });
        })
    };

};
