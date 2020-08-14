'use strict';

//Setting up route
angular.module('ventas').config(['$stateProvider',
	function($stateProvider) {
		// Ventas state routing
		$stateProvider.
		state('ventas', {
			abstract: true,
			url: '/ventas',
			template: '<ui-view/>'
		}).
		state('ventas.list', {
			url: '',
			templateUrl: 'modules/ventas/views/list-ventas.client.view.html'
		}).
		state('ventas.create', {
			url: '/create',
			templateUrl: 'modules/ventas/views/create-venta.client.view.html'
		}).
		state('ventas.view', {
			url: '/:ventaId',
			templateUrl: 'modules/ventas/views/view-venta.client.view.html'
		}).
		state('ventas.edit', {
			url: '/:ventaId/edit',
			templateUrl: 'modules/ventas/views/edit-venta.client.view.html'
		}).
		state('ventas.mostrador', {
            url: '/mostrador',
            templateUrl: 'modules/ventas/views/ventas-mostrador.client.view.html'
        });
	}
]);