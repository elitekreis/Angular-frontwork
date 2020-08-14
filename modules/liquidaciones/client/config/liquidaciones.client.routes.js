'use strict';

//Setting up route
angular.module('liquidaciones').config(['$stateProvider',
	function($stateProvider) {
		// liquidaciones state routing
		$stateProvider.
		state('liquidaciones', {
			abstract: true,
			url: '/liquidaciones',
			template: '<ui-view/>'
		}).
		state('liquidaciones.list', {
			url: '',
			templateUrl: 'modules/liquidaciones/views/list-liquidaciones.client.view.html'
		}).
		state('liquidaciones.create', {
			url: '/create',
			templateUrl: 'modules/liquidaciones/views/create-liquidacion.client.view.html'
		}).
		state('liquidaciones.view', {
			url: '/:liquidacionId',
			templateUrl: 'modules/liquidaciones/views/view-liquidacion.client.view.html'
		}).
		state('liquidaciones.edit', {
			url: '/:liquidacionId/edit',
			templateUrl: 'modules/liquidaciones/views/edit-liquidacion.client.view.html'
		});
	}
]);