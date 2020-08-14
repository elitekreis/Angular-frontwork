'use strict';

//Setting up route
angular.module('cajas').config(['$stateProvider',
	function($stateProvider) {
		// Comprobantes state routing
		$stateProvider.
		state('cajas', {
			abstract: true,
			url: '/cajas',
			template: '<ui-view/>'
		}).
		state('cajas.list', {
			url: '',
			templateUrl: 'modules/cajas/views/list-cajas.client.view.html'
		}).
		state('cajas.create', {
			url: '/create',
			templateUrl: 'modules/cajas/views/create-caja.client.view.html'
		}).
		state('cajas.view', {
			url: '/:cajaId',
			templateUrl: 'modules/cajas/views/view-caja.client.view.html'
		}).
		state('cajas.edit', {
			url: '/:cajaId/edit',
			templateUrl: 'modules/cajas/views/edit-caja.client.view.html'
		});
	}
]);