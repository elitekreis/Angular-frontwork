'use strict';

module.exports = function(app) {
    var impuestos = require('../controllers/impuestos.server.controller');
    var impuestosPolicy = require('../policies/impuestos.server.policy');

    // Impuestos Routes
    app.route('/api/impuestos').all()
        .get(impuestos.list).all(impuestosPolicy.isAllowed)
        .post(impuestos.create);

    app.route('/api/impuestos/updateTotal').all(impuestosPolicy.isAllowed)
        .put(impuestos.updateTotal)
        .post(impuestos.updateAutomaticoImpuestos);

    app.route('/api/impuestos/ajustar').all(impuestosPolicy.isAllowed)
        .get(impuestos.listAjustar)
        .put(impuestos.addAjustar);

    app.route('/api/impuestos/:impuestoId').all(impuestosPolicy.isAllowed)
        .get(impuestos.read)
        .put(impuestos.update)
        .delete(impuestos.delete);

    // Finish by binding the Impuestos middleware
    app.param('impuestoId', impuestos.impuestoByID);
};