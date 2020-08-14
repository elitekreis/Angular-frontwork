'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    Liquidacion = mongoose.model('Liquidacion'),
    User = mongoose.model('User'),
    Moment = require('moment'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.create = function (req, res) {
    var liquidacion = new Liquidacion(req.body);
    liquidacion.user = req.user;
    liquidacion.created = new Date();

    liquidacion.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(liquidacion);
        }
    });
};

exports.read = function (req, res) {
    res.jsonp(req.liquidacion);
};

exports.update = function (req, res) {
    var liquidacion = req.liquidacion;
    liquidacion = _.extend(liquidacion, req.body);

    liquidacion.save(function (err) {
        if (err) {
            console.log('Error al actualizar liquidacion:', err);          
        } else {  
            res.jsonp(liquidacion);
        }
    });
};

exports.delete = function (req, res) {
    var liquidacion = req.liquidacion;
    liquidacion.deleted = true;
    liquidacion.save(function (err) {
        if (err) {
            return res.status(400).send({message: errorHandler.getErrorMessage(err)});
        } else {
            res.jsonp(liquidacion);
        }
    });
};

exports.list = function (req, res) {
    var enterprise = req.query.e || null;
    if (enterprise !== null) {
        Liquidacion.find({enterprise: enterprise}).sort('-created').populate('enterprise', 'name').exec(function (err, liquidaciones) {
            if (err) {
                console.log("[E] error buscando liquidaciones: ", err);
                return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {
                console.log("liquidaciones1");
                res.jsonp(liquidaciones);
            }
        });
    } else {
        Liquidacion.find().sort('-created').populate('enterprise', 'name').exec(function (err, liquidaciones) {
            if (err) {
                return res.status(400).send({message: errorHandler.getErrorMessage(err)});
            } else {
                console.log("liquidaciones2");
                
                res.jsonp(liquidaciones);
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

        Liquidacion.find({
            empleado: empleadoId,
            deleted: false,
            fechaDeLiquidacion2: {
                $gt: startDate,
                $lt: endDate
            }})
            .sort('-created')
            .populate('empleado')
            .exec(function (err, liquidaciones) {
                if (err) {
                    console.log("[E] error buscando liquidaciones: ", err);
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {

                    User.populate(liquidaciones, {
                        path: 'empleado.userLogin',
                        select: 'displayName',
                      }, function(err, user){
                        console.log("user=", user);
                        res.jsonp(user);
                      });

                }
            });
    } else {
        Liquidacion.find({empleado: empleadoId, deleted: false})
            .sort('-created')
            .populate('empleado')
            .exec(function (err, liquidaciones) {
                if (err) {
                    console.log("[E] error buscando liquidaciones: ", err);
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)});
                } else {
                    res.jsonp(liquidaciones);
                }
            });
    }
};

exports.queryAll = function(req,res) {
    var year = req.body.year;
    var month = req.body.month;
    var startDate = Moment().startOf('month');
    var endDate = startDate.clone().endOf('month');

    if (month && year) {
        startDate = Moment().year(year).month(month).startOf("month");
        endDate = startDate.clone().endOf('month');
    } else if (month) {
        startDate = Moment().month(month).startOf("month");
        endDate = startDate.clone().endOf('month');
    } else if (year) {
        startDate = Moment().year(year).startOf("year");
        endDate = startDate.clone().endOf('year');
    }



    Liquidacion.find({
        fechaDeLiquidacion2: {
           $gt: startDate.format(),
           $lt: endDate.format()
        },
        deleted: false
    },function(err,data){

        if(err) throw err;

        var sendObj = {};
        sendObj.total = 0;
        var elemPos;
        var empleadosList = req.body.empList;
        console.log(empleadosList,"====",data)
        for(var i = 0; i < empleadosList.length; i++){
            //console.log(typeof data[0].empleado + " / " + typeof empleadosList[i]._id);
            //elemPos = data.map(function(x){return x.empleado}).indexOf(empleadosList[i]._id);
            for(var j = 0; j < data.length; j++){
                if(data[j].empleado === empleadosList[i]._id){
                    if(data[j])
                        sendObj.total += data[j].total;
                }
            }
            /*if(elemPos !== -1) {               
                sendObj.total += data[elemPos].total; 
              

            }*/
            
        }

        res.json(sendObj);
    })

}
 
exports.liquidacionByID = function (req, res, next, id) {
    Liquidacion.findById(id)
        .populate('empleado')
        .populate('enterprise', 'name')
        .exec(function (err, liquidacion) {
        if (err)
            return next(err);
        if (!liquidacion)
            return next(new Error('Failed to load liquidacion ' + id));
        req.liquidacion = liquidacion;
        next();
    });
};
