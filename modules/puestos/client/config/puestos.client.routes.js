'use strict';

//Setting up route
angular.module('puestos').config(['$stateProvider',
	function($stateProvider) {
		// Puestos state routing
		$stateProvider.
		state('puestos', {
			abstract: true,
			url: '/puestos',
			template: '<ui-view/>'
		}).
		state('puestos.list', {
			url: '',
			templateUrl: 'modules/puestos/views/list-puestos.client.view.html'
		}).
		state('puestos.create', {
			url: '/create',
			templateUrl: 'modules/puestos/views/create-puesto.client.view.html'
		}).
		state('puestos.view', {
			url: '/:puestoId',
			templateUrl: 'modules/puestos/views/view-puesto.client.view.html'
		}).
		state('puestos.edit', {
			url: '/:puestoId/edit',
			templateUrl: 'modules/puestos/views/edit-puesto.client.view.html'
		});
	}
]);