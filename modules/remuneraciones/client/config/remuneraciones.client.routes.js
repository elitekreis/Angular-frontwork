'use strict';

//Setting up route
angular.module('remuneraciones').config(['$stateProvider',
	function($stateProvider) {
		// remuneraciones state routing
		$stateProvider.
		state('remuneraciones', {
			abstract: true,
			url: '/remuneraciones',
			template: '<ui-view/>'
		}).
		state('remuneraciones.list', {
			url: '',
			templateUrl: 'modules/remuneraciones/views/list-remuneraciones.client.view.html'
		}).
		state('remuneraciones.create', {
			url: '/create',
			templateUrl: 'modules/remuneraciones/views/create-remuneracione.client.view.html'
		}).
		state('remuneraciones.view', {
			url: '/:remuneracioneId',
			templateUrl: 'modules/remuneraciones/views/view-remuneracione.client.view.html'
		}).
		state('remuneraciones.edit', {
			url: '/:remuneracioneId/edit',
			templateUrl: 'modules/remuneraciones/views/edit-remuneracione.client.view.html'
		});
	}
]);