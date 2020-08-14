'use strict';

//Setting up route
angular.module('providers').config(['$stateProvider',
	function($stateProvider) {
		// Providers state routing
		$stateProvider.
		state('providers', {
			abstract: true,
			url: '/providers',
			template: '<ui-view/>'
		}).
		state('providers.list', {
			url: '',
			templateUrl: 'modules/providers/views/list-providers.client.view.html'
		}).
		state('providers.create', {
			url: '/create',
			templateUrl: 'modules/providers/views/create-provider.client.view.html'
		}).
		state('providers.view', {
			url: '/:providerId',
			templateUrl: 'modules/providers/views/view-provider.client.view.html'
		}).
		state('providers.edit', {
			url: '/:providerId/edit',
			templateUrl: 'modules/providers/views/edit-provider.client.view.html'
		});
	}
]);