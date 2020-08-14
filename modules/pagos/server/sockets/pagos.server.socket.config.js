'use strict';

var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Enterprise = mongoose.model('Enterprise'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    Pago = mongoose.model('Pago'),
    Factura = mongoose.model('Facturado'),
    Caja = mongoose.model('Caja'),
    Servicio = mongoose.model('Servicio');

// Create the chat configuration
module.exports = function (io, socket) {

    //get enterprises and create socket namespaces
    getEnterprises(function (result) {
        if (result.status !== 'success') {
            console.log('Error al recibir listado de empresas para el socket: ', result.message);
        } else {
            //console.log('data: ', JSON.stringify(result.data));
            if (result.data.length > 0) {
                var enterprises = result.data;
                var namespaces = {};

                enterprises.forEach(function (enterprise) {
                    namespaces[enterprise.name] = io.of('/' + enterprise.name);
                });
                //console.log('namespace:', namespaces);
            } else {
                console.log('Error, no se han creado empresas?');
            }
        }
    });


    //get list of posts for enterpise when message is received
    socket.on('pago.create', function (message) {
      createPago(message, function (result) {
          if (result.status !== 'success') {
              console.log('Error al escribir en db: ', result.message);
          } else {
              //io.emit('costosindirecto.update', result.data);
          }
      });
    });

    function createPago(message, callback) {  
      var pago = new Pago(message);
      pago.user = socket.request.user;
       if (message.type !== 'impuesto' && message.type !== 'personal') {
          updateServios(pago,message);
       } else {
            updateCaja(pago,function(caja){  
              pago.save(function(err,info){
                if(err) throw err;
                console.log("pago saved!")
              });

              caja.save(function(err,info){
                if(err) throw err;
                console.log("caja saved!")
              });
             
            })
            
       }
   
      callback({status: 'success', data: message});

    }


    function updateServios(t,m) {
      // cajaConId(t.cajaD, function(c){
      Servicio.findById(t.servicios)
        .populate('user','displayName')
        .exec(function (err, c) {
            if(err) throw err;
            c.pagoAcumulados = c.pagoAcumulados + t.montoE + t.montoC;

            if(!c.operacion) {
              c.operacion = [];
            }

            updateCaja(t,function(caja){
              var id = genId();
              var newSaldo;
              if(c.operacion.length > 0){
                var lastOperacion = c.operacion[c.operacion.length - 1];
                newSaldo = lastOperacion.saldo - t.montoE;
              } else {
                newSaldo = 0 - t.montoE;
              }

              var date = + new Date();

              c.operacion.push({
                id: id,
                _id: t._id.toString(),
                type: "pago",
                saldo: newSaldo,
                date: date,
                montoE: t.montoE,
                cajaname: caja.name,
                cajaD: t.cajaD,
                facturado: m.facturado,
                pagado: c.pagoAcumulados,
                numero: m.numero,
                created_by: c.user.displayName,
                observaciones: t.observaciones,
                serviceId: t.servicios,
                pagoDate: t.pagoDate || new Date()
              });
              
              c.save(function (err) {
                if (err) {
                    console.log(err, 'error');
                } else {
                    console.log('pago ok');
                }
              });

              caja.save(function(err,info){
                if(err){
                    console.log(err);
                } else {
                    console.log("caja saved!")
                }
                
              })

              //save newly created pago;
              t.save(function(err,info){
                if(err) {
                  console.log(err)
                } else {
                  console.log("pago saved")
                }
              })

              function genId() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567899966600555777222";

                  for( var i=0; i < 15; i++ )
                      text += possible.charAt(Math.floor(Math.random() * possible.length));
                  return text;
              }
            });                
        })
    }

    function updateFactura(f,m) {

        Factura.findOne({servicios: f.servicios},{total:1})
            .exec(function(err,data){
                if(err) throw err;
                if(data) {
                    data.total -= m.montoE;
                    data.save(function(err,info){
                        console.log("facturado update saved!")
                    })
                }
            })

    }

    function updateCaja(t,cb) {
        // cajaConId(t.cajaO, function(c){
            //console.log(t.cajaD);
        Caja.findOne({_id: t.cajaD})
        .exec(function (err, c) {
            if(err) throw err;
            c.efectivo = c.efectivo - t.montoE;
            c.cheques = c.cheques - t.montoC;                
            c.total = c.cheques + c.efectivo + c.debito + c.credito + c.dolares;
            t.saldo = c.total;
            //update pagos caja for view in utimate movimentos;           
            cb(c);
            /*c.save(function (err) {
                if (err) {
                    console.log(err);
                } else {                        
                    console.log('Caja pago origen actualizada ok');
                }
            });*/
        })
    }

    function getEnterprises(callback) {
        Enterprise.find()
            .sort('-created')
            .exec(function (err, enterprises) {
                if (err) {
                    callback({status: 'error', message: errorHandler.getErrorMessage(err)});
                } else {
                    callback({status: 'success', data: enterprises});
                }
            });
    }
};
