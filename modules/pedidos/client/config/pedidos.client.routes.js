'use strict';

//Setting up route
angular.module('pedidos').config(['$stateProvider',
	function($stateProvider) {
		// Pedidos state routing
		$stateProvider.
		state('pedidos', {
			abstract: true,
			url: '/pedidos',
			template: '<ui-view/>'
		}).
		state('pedidos.list', {
			url: '',
			templateUrl: 'modules/pedidos/views/list-pedidos.client.view.html'
		}).
		state('pedidos.create', {
			url: '/create',
			templateUrl: 'modules/pedidos/views/create-pedido.client.view.html'
		}).
		state('pedidos.view', {
			url: '/:pedidoId',
			templateUrl: 'modules/pedidos/views/view-pedido.client.view.html'
		}).
		state('pedidos.edit', {
			url: '/:pedidoId/edit',
			templateUrl: 'modules/pedidos/views/edit-pedido.client.view.html'
		});
	}
]);