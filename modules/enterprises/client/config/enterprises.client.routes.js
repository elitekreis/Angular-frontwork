'use strict';

//Setting up route
angular.module('enterprises').config(['$stateProvider',
	function($stateProvider) {
		// Enterprises state routing
		$stateProvider.
		state('enterprises', {
			abstract: true,
			url: '/enterprises',
			template: '<ui-view/>'
		}).
		state('enterprises.list', {
			url: '',
			templateUrl: 'modules/enterprises/views/list-enterprises.client.view.html'
		}).
		state('enterprises.create', {
			url: '/create',
			templateUrl: 'modules/enterprises/views/create-enterprise.client.view.html'
		}).
		state('enterprises.view', {
			url: '/:enterpriseId',
			templateUrl: 'modules/enterprises/views/view-enterprise.client.view.html'
		}).
		state('enterprises.edit', {
			url: '/:enterpriseId/edit',
			templateUrl: 'modules/enterprises/views/edit-enterprise.client.view.html'
		});
	}
]);