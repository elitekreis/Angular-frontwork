'use strict';

//Setting up route
angular.module('historialCompras').config(['$stateProvider',
	function($stateProvider) {
		// Compras state routing
		$stateProvider.
		state('historialCompras', {
			abstract: true,
			url: '/historialCompras',
			template: '<ui-view/>'
		})
		.
		state('historialCompras.list', {
			url: '',
			templateUrl: 'modules/historialCompras/client/views/list-historialCompras.client.view.html'
		})
		// .
		// state('historialCompras.create', {
		// 	url: '/create',
		// 	templateUrl: 'modules/historialCompras/views/create-compra.client.view.html'
		// }).
		// state('historialCompras.view', {
		// 	url: '/:compraId',
		// 	templateUrl: 'modules/historialCompras/views/view-compra.client.view.html'
		// }).
		// state('historialCompras.edit', {
		// 	url: '/:compraId/edit',
		// 	templateUrl: 'modules/historialCompras/views/edit-compra.client.view.html'
		// })
		;
	}
]);