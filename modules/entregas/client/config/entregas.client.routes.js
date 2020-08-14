'use strict';

//Setting up route
angular.module('entregas').config(['$stateProvider',
	function($stateProvider) {
		// Entregas state routing
		$stateProvider.
		state('entregas', {
			abstract: true,
			url: '/entregas',
			template: '<ui-view/>'
		}).
		state('entregas.list', {
			url: '',
			templateUrl: 'modules/entregas/views/list-entregas.client.view.html'
		}).
		state('entregas.create', {
			url: '/create',
			templateUrl: 'modules/entregas/views/create-entrega.client.view.html'
		}).
		state('entregas.view', {
			url: '/:entregaId',
			templateUrl: 'modules/entregas/views/view-entrega.client.view.html'
		}).
		state('entregas.edit', {
			url: '/:entregaId/edit',
			templateUrl: 'modules/entregas/views/edit-entrega.client.view.html'
		});
	}
]);