'use strict';

//Setting up route
angular.module('procedimientos').config(['$stateProvider',
	function($stateProvider) {
		// Procedimientos state routing
		$stateProvider.
		state('procedimientos', {
			abstract: true,
			url: '/procedimientos',
			template: '<ui-view/>'
		}).
		state('procedimientos.list', {
			url: '',
			templateUrl: 'modules/procedimientos/views/list-procedimientos.client.view.html'
		}).
		state('procedimientos.create', {
			url: '/create',
			templateUrl: 'modules/procedimientos/views/create-procedimiento.client.view.html'
		}).
		state('procedimientos.view', {
			url: '/:procedimientoId',
			templateUrl: 'modules/procedimientos/views/view-procedimiento.client.view.html'
		}).
		state('procedimientos.edit', {
			url: '/:procedimientoId/edit',
			templateUrl: 'modules/procedimientos/views/edit-procedimiento.client.view.html'
		});
	}
]);