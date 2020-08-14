'use strict';

//Setting up route
angular.module('movimientos').config(['$stateProvider',
	function($stateProvider) {
		// finanzas state routing
		$stateProvider.
		state('movimientos', {
			abstract: true,
			url: '/movimientos',
			template: '<ui-view/>'
		}).
		state('movimientos.list', {
			url: '',
			templateUrl: 'modules/movimientos/views/list-movimientos.client.view.html'
		}).
		state('movimiento.create', {
			url: '/create',
			templateUrl: 'modules/movimientos/views/create-movimiento.client.view.html'
		}).
		state('movimientos.view', {
			url: '/:movimientoId',
			templateUrl: 'modules/movimientos/views/view-movimiento.client.view.html'
		}).
		state('movimientos.edit', {
			url: '/:movimientoId/edit',
			templateUrl: 'modules/movimientos/views/edit-movimiento.client.view.html'
		});
	}
]);