'use strict';

//Setting up route
angular.module('clients').config(['$stateProvider',
	function($stateProvider) {
		// Clients state routing
		$stateProvider.
		state('clients', {
			abstract: true,
			url: '/clients',
			template: '<ui-view/>'
		}).
		state('clients.list', {
			url: '',
			templateUrl: 'modules/clients/views/list-clients.client.view.html'
		}).
		state('clients.create', {
			url: '/create',
			templateUrl: 'modules/clients/views/create-client.client.view.html'
		}).
		state('clients.view', {
			url: '/:clientId',
			templateUrl: 'modules/clients/views/view-client.client.view.html'
		}).
		state('clients.edit', {
			url: '/:clientId/edit',
			templateUrl: 'modules/clients/views/edit-client.client.view.html'
		});
	}
]);