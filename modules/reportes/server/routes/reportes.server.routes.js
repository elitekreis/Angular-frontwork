'use strict';

module.exports = function(app) {
    var reportes = require('../controllers/reportes.server.controller');
    var reportesPolicy = require('../policies/reportes.server.policy');

    // Ventas Routes
    app.route('/api/reportes').all()
        .get(reportes.list).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/byQ/:quarter').all()
        .get(reportes.reporteVentaPorQ).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/byYear/:year').all()
        .get(reportes.reporteVentaPorYear).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/byMonth/:month').all()
        .get(reportes.reporteVentaPorMonth).all(reportesPolicy.isAllowed)
        //.post(reportes.create);

    // api that gives list of sales by products or category @start

    app.route('/api/reportes/ventas/byDay/:day').all()
        .get(reportes.reporteVentaPorDay).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/byWeek/:week').all()
        .get(reportes.reporteVentaPorWeek).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/byMonthDetailed/:month').all()
        .get(reportes.reporteVentaPorMonthDetailed).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/byRange').all()
        .get(reportes.reporteVentaPorRange).all(reportesPolicy.isAllowed)



    app.route('/api/reportes/compras/byDay/:day').all()
        .get(reportes.reporteCompraPorDay).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/compras/byWeek/:week').all()
        .get(reportes.reporteCompraPorWeek).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/compras/byMonthDetailed/:month').all()
        .get(reportes.reporteCompraPorMonthDetailed).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/compras/byRange').all()
        .get(reportes.reporteCompraPorRange).all(reportesPolicy.isAllowed)

    // api that gives list of sales by products or category @end

    app.route('/api/reportes/ventas/productos/byQ/:quarter').all()
        .get(reportes.reporteVentaProductosPorQ).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/productos/byYear/:year').all()
        .get(reportes.reporteVentaProductosPorYear).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/productos/byMonth/:month').all()
        .get(reportes.reporteVentaProductosPorMonth).all(reportesPolicy.isAllowed)





    app.route('/api/reportes/ventas/categorias/byYear/:year').all()
        .get(reportes.reporteVentacategoriasPorYear).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/categorias/byDay/:Day').all()
        .get(reportes.reporteVentacategoriasPorDay).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/condiventa/byDay/:Day').all()
        .get(reportes.reporteVentacondiventaPorDay).all(reportesPolicy.isAllowed)
    app.route('/api/reportes/ventas/comprobante/byDay/:Day').all()
        .get(reportes.reporteVentacomprobantePorDay).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/comprobante/byDay/:Day').all()
        .get(reportes.reporteVentacomprobantePorDayPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/condiventa/byDay/:Day').all()
        .get(reportes.reporteVentacondiventaPorDayPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/byDay/:Day').all()
        .get(reportes.reporteVentacategoriasPorDayPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/categorias/byWeek/:Week').all()
        .get(reportes.reporteVentacategoriasPorWeek).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/byWeek/:Week').all()
        .get(reportes.reporteVentacategoriasPorWeekPuesto).all(reportesPolicy.isAllowed)



    app.route('/api/reportes/ventas/condiVenta/byWeek/:Week').all()
        .get(reportes.reporteVentacondiventaPorWeek).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/condiVenta/byWeek/:Week').all()
        .get(reportes.reporteVentacondiventaPorWeekPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/comprobante/byWeek/:Week').all()
        .get(reportes.reporteVentacomprobantePorWeek).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/comprobante/byWeek/:Week').all()
        .get(reportes.reporteVentacomprobantePorWeekPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/categorias/byMonth/:Month').all()
        .get(reportes.reporteVentacategoriasPorMonth).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/byMonth/:Month').all()
        .get(reportes.reporteVentacategoriasPorMonthPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/condiVenta/byMonth/:Month').all()
        .get(reportes.reporteVentacondiventaPorMonth).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/condiVenta/byMonth/:Month').all()
        .get(reportes.reporteVentacondiventaPorMonthPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/comprobante/byMonth/:Month').all()
        .get(reportes.reporteVentacomprobantePorMonth).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/comprobante/byMonth/:Month').all()
        .get(reportes.reporteVentacomprobantePorMonthPuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/categorias/byRange').all()
        .get(reportes.reporteVentacategoriasPorRange).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/byRange').all()
        .get(reportes.reporteVentacategoriasPorRangePuesto).all(reportesPolicy.isAllowed)


    app.route('/api/reportes/ventas/condiVenta/byRange').all()
        .get(reportes.reporteVentacondiventaPorRange).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/condiVenta/byRange').all()
        .get(reportes.reporteVentacondiventaPorRangePuesto).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/comprobante/byRange').all()
        .get(reportes.reporteVentacomprobantePorRange).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/ventas/puestos/comprobante/byRange').all()
        .get(reportes.reporteVentacomprobantePorRangePuesto).all(reportesPolicy.isAllowed)



    app.route('/api/reportes/compras/byQ/:quarter').all()
        .get(reportes.reporteCompraPorQ).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/compras/byYear/:year').all()
        .get(reportes.reporteCompraPorYear).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/compras/byMonth/:month').all()
        .get(reportes.reporteCompraPorMonth).all(reportesPolicy.isAllowed)

    app.route('/api/reportes/:reporteId').all(reportesPolicy.isAllowed)
        .get(reportes.read)

    app.route('/api/reportes/compras/categorias/byDay/:Day').get(reportes.reporteComprascategoriasPorDay)

    app.route('/api/reportes/compras/categorias/byWeek/:Week').get(reportes.reporteComprascategoriasPorWeek)

    app.route('/api/reportes/compras/categorias/byMonth/:Month').get(reportes.reporteComprascategoriasPorMonth)

    app.route('/api/reportes/compras/categorias/byRange/').get(reportes.reporteComprascategoriasPorRange)



    //.put(reportes.update)
    //.delete(reportes.delete);

    // Finish by binding the Venta middleware
    //app.param('reporteId', reportes.reporteByID);
};