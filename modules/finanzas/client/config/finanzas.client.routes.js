'use strict';

//Setting up route
angular.module('finanzas').config(['$stateProvider',
	function($stateProvider) {
		// Comprobantes state routing
		$stateProvider.
		state('finanzas', {
			abstract: true,
			url: '/finanzas',
			template: '<ui-view/>'
		}).
		state('finanzas.list', {
			url: '',
			templateUrl: 'modules/finanzas/views/list-finanzas.client.view.html'
		}).
		state('finanzas.create', {
			url: '/create',
			templateUrl: 'modules/finanzas/views/create-finanza.client.view.html'
		}).
		state('finanzas.view', {
			url: '/:finanzaId',
			templateUrl: 'modules/finanzas/views/view-finanza.client.view.html'
		}).
		state('finanzas.edit', {
			url: '/:finanzaId/edit',
			templateUrl: 'modules/finanzas/views/edit-finanza.client.view.html'
		});
	}
]);