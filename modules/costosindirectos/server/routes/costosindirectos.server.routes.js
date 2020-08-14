'use strict';

/**
 * Module dependencies
 */

module.exports = function(app) {
var costosindirectosPolicy = require('../policies/costosindirectos.server.policy');
var  costosindirectos = require('../controllers/costosindirectos.server.controller');

  // Costosindirectos Routes
  app.route('/api/costosindirectos').all(costosindirectosPolicy.isAllowed)
    .get(costosindirectos.list)
    .post(costosindirectos.create);

  app.route('/api/costosindirectos/:costosindirectoId').all(costosindirectosPolicy.isAllowed)
    .get(costosindirectos.read)
    .put(costosindirectos.update)
    .delete(costosindirectos.delete);

  // Finish by binding the Costosindirecto middleware
  app.param('costosindirectoId', costosindirectos.costosindirectoByID);
};
