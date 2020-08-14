'use strict';

//Setting up route
angular.module('sucursales').config(['$stateProvider',
	function($stateProvider) {
		// Comprobantes state routing
		$stateProvider.
		state('sucursales', {
			abstract: true,
			url: '/sucursales',
			template: '<ui-view/>'
		}).
		state('sucursales.list', {
			url: '',
			templateUrl: 'modules/sucursales/views/list-sucursales.client.view.html'
		}).
		state('sucursales.create', {
			url: '/create',
			templateUrl: 'modules/sucursales/views/create-sucursal.client.view.html'
		}).
		state('sucursales.view', {
			url: '/:sucursalId',
			templateUrl: 'modules/sucursales/views/view-sucursal.client.view.html'
		}).
		state('sucursales.edit', {
			url: '/:sucursalId/edit',
			templateUrl: 'modules/sucursales/views/edit-sucursal.client.view.html'
		});
	}
]);