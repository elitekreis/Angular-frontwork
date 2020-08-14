'use strict';

/**
 * Module dependencies
 */
var empleadosPolicy = require('../policies/empleados.server.policy'),
    empleados = require('../controllers/empleados.server.controller');

module.exports = function (app) {
    // Empleados Routes
    app.route('/api/empleados').all(empleadosPolicy.isAllowed)
        .get(empleados.list)
        .put(empleados.findByCentroDeCosto)
        .post(empleados.create);

    app.route('/api/empleados/user').all(empleadosPolicy.isAllowed)
        .post(empleados.findByUser);

    app.route('/api/empleados/:empleadoId').all(empleadosPolicy.isAllowed)
        .get(empleados.read)
        .put(empleados.update)
        .delete(empleados.delete);

    // Finish by binding the Empleado middleware
    app.param('empleadoId', empleados.empleadoByID);
};
