'use strict';

module.exports = function(app) {
    var cajas = require('../controllers/cajas.server.controller');
    var cajasPolicy = require('../policies/cajas.server.policy');

    // cajas Routes
    app.route('/api/cajas').all()
        .get(cajas.list).all(cajasPolicy.isAllowed)
        .post(cajas.create);

    app.route('/api/cajas/:cajaId').all(cajasPolicy.isAllowed)
        .get(cajas.read)
        .put(cajas.update)
        .delete(cajas.delete);
    app.route('/api/cajas/updateTotal').all(cajasPolicy.isAllowed)
        .put(cajas.updateTotal)
        // Finish by binding the Comprobante middleware
    app.param('cajaId', cajas.cajaByID);
};