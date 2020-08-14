'use strict';

//Setting up route
angular.module('condicionventas').config(['$stateProvider',
	function($stateProvider) {
		// Condicionventas state routing
		$stateProvider.
		state('condicionventas', {
			abstract: true,
			url: '/condicionventas',
			template: '<ui-view/>'
		}).
		state('condicionventas.list', {
			url: '',
			templateUrl: 'modules/condicionventas/views/list-condicionventas.client.view.html'
		}).
		state('condicionventas.create', {
			url: '/create',
			templateUrl: 'modules/condicionventas/views/create-condicionventa.client.view.html'
		}).
		state('condicionventas.view', {
			url: '/:condicionventaId',
			templateUrl: 'modules/condicionventas/views/view-condicionventa.client.view.html'
		}).
		state('condicionventas.edit', {
			url: '/:condicionventaId/edit',
			templateUrl: 'modules/condicionventas/views/edit-condicionventa.client.view.html'
		});
	}
]);