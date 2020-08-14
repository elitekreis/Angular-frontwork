'use strict';

//Setting up route
angular.module('costcenters').config(['$stateProvider',
	function($stateProvider) {
		// Costcenters state routing
		$stateProvider.
		state('costcenters', {
			abstract: true,
			url: '/costcenters',
			template: '<ui-view/>'
		}).
		state('costcenters.list', {
			url: '',
			templateUrl: 'modules/costcenters/views/list-costcenters.client.view.html'
		}).
		state('costcenters.create', {
			url: '/create',
			templateUrl: 'modules/costcenters/views/create-costcenter.client.view.html'
		}).
		state('costcenters.view', {
			url: '/:costcenterId',
			templateUrl: 'modules/costcenters/views/view-costcenter.client.view.html'
		}).
		state('costcenters.edit', {
			url: '/:costcenterId/edit',
			templateUrl: 'modules/costcenters/views/edit-costcenter.client.view.html'
		});
	}
]);