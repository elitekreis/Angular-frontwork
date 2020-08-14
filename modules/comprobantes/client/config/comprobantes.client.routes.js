'use strict';

//Setting up route
angular.module('comprobantes').config(['$stateProvider',
	function($stateProvider) {
		// Comprobantes state routing
		$stateProvider.
		state('__comprobantes', {
			abstract: true,
			url: '/__comprobantes',
			template: '<ui-view/>'
		}).
		state('__comprobantes.list', {
			url: '',
			templateUrl: 'modules/comprobantes/views/list-comprobantes.client.view.html'
		}).
		state('__comprobantes.create', {
			url: '/create',
			templateUrl: 'modules/comprobantes/views/create-comprobante.client.view.html'
		}).
		state('__comprobantes.view', {
			url: '/:comprobanteId',
			templateUrl: 'modules/comprobantes/views/view-comprobante.client.view.html'
		}).
		state('__comprobantes.edit', {
			url: '/:comprobanteId/edit',
			templateUrl: 'modules/comprobantes/views/edit-comprobante.client.view.html'
		});
	}
]);