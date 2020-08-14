'use strict';

/**
 * Module dependencies
 */
var pagosPolicy = require('../policies/pagos.server.policy'),
  pagos = require('../controllers/pagos.server.controller');

module.exports = function(app) {
  // Pagos Routes
  app.route('/api/pagos').all()
    .get(pagos.list).all(pagosPolicy.isAllowed)
    .post(pagos.create);
    
  app.route('/api/pagos/getCostoLastMonthTotal').all()
    .get(pagos.getCostoLastMonthTotal)
    .post(pagos.getCostoLastMonthTotal);

  app.route('/api/pagos/getServiciosLastMonthTotal').all()
    .get(pagos.getServiciosLastMonthTotal)
    .post(pagos.getServiciosLastMonthTotal);

  app.route('/api/pagos/loadmorebycaja').all()  
    .get(pagos.loadMoreByCaja);    

  app.route('/api/pagos/loadmorebycaja_date').all()
    .get(pagos.loadMoreByCajaDate);        

  app.route('/api/pagos/:pagoId').all(pagosPolicy.isAllowed)
    .get(pagos.read)
    .put(pagos.update)
    .delete(pagos.delete);

  // Finish by binding the Pago middleware
  app.param('pagoId', pagos.pagoByID);
};


