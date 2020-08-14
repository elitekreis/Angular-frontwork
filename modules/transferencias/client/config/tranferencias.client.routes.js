'use strict';

//Setting up route
angular.module('transferencias').config(['$stateProvider',
	function($stateProvider) {
		// Comprobantes state routing
		$stateProvider.
		state('transferencias', {
			abstract: true,
			url: 'transferencias',
			template: '<ui-view/>'
		}).
		state('transferencias.list', {
			url: '',
			templateUrl: 'modules/transferencias/views/list-transferencias.client.view.html'
		}).
		state('transferencias.create', {
			url: '/create',
			templateUrl: 'modules/transferencias/views/create-transferencia.client.view.html'
		}).
		state('transferencias.view', {
			url: '/:transfereciaId',
			templateUrl: 'modules/transferencias/views/view-transferencia.client.view.html'
		}).
		state('transferencias.edit', {
			url: '/:transferenciaId/edit',
			templateUrl: 'modules/transferencias/views/edit-transferencia.client.view.html'
		});
	}
]);