'use strict';

/**
 * Module dependencies
 */
var serviciosPolicy = require('../policies/servicios.server.policy'),
  servicios = require('../controllers/servicios.server.controller');

module.exports = function(app) {
  // Servicios Routes
  app.route('/api/servicios').all(serviciosPolicy.isAllowed)
    .get(servicios.list)
    .post(servicios.create);
  app.route('/api/servicios/getCentroByServicios').all(serviciosPolicy.isAllowed)
  .get(servicios.getCentroByServicios)
  .post(servicios.getCentroByServicios);

  app.route('/api/servicios/:servicioId').all(serviciosPolicy.isAllowed)
    .get(servicios.read)
    .put(servicios.update)
    .delete(servicios.delete);

// Finish by binding the Servicio middleware
  app.param('servicioId', servicios.servicioByID);
};
