'use strict';

//Setting up route
angular.module('compras').config(['$stateProvider',
	function($stateProvider) {
		// Compras state routing
		$stateProvider.
		state('compras_', {
			abstract: true,
			url: '/compras_',
			template: '<ui-view/>'
		}).
		state('compras.list', {
			url: '',
			templateUrl: 'modules/compras/views/list-compras.client.view.html'
		}).
		state('compras.create', {
			url: '/create',
			templateUrl: 'modules/compras/views/create-compra.client.view.html'
		}).
		state('compras.view', {
			url: '/:compraId',
			templateUrl: 'modules/compras/views/view-compra.client.view.html'
		}).
		state('compras.edit', {
			url: '/:compraId/edit',
			templateUrl: 'modules/compras/views/edit-compra.client.view.html'
		});
	}
]);