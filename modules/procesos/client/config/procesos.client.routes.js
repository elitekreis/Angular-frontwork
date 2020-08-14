'use strict';

//Setting up route
angular.module('procesos').config(['$stateProvider',
	function($stateProvider) {
		// Procesos state routing
		$stateProvider.
		state('procesos', {
			abstract: true,
			url: '/procesos',
			template: '<ui-view/>'
		}).
		state('procesos.list', {
			url: '',
			templateUrl: 'modules/procesos/views/list-procesos.client.view.html'
		}).
		state('procesos.create', {
			url: '/create',
			templateUrl: 'modules/procesos/views/create-proceso.client.view.html'
		}).
		state('procesos.view', {
			url: '/:procesoId',
			templateUrl: 'modules/procesos/views/view-proceso.client.view.html'
		}).
		state('procesos.edit', {
			url: '/:procesoId/edit',
			templateUrl: 'modules/procesos/views/edit-proceso.client.view.html'
		});
	}
]);