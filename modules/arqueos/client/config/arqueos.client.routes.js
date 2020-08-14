'use strict';

//Setting up route
angular.module('arqueos').config(['$stateProvider',
	function($stateProvider) {
		// Comprobantes state routing
		$stateProvider.
		state('arqueos', {
			abstract: true,
			url: '/arqueos',
			template: '<ui-view/>'
		}).
		state('arqueos.list', {
			url: '',
			templateUrl: 'modules/arqueos/views/list-arqueos.client.view.html'
		}).
		state('arqueos.create', {
			url: '/create',
			templateUrl: 'modules/arqueos/views/create-arqueo.client.view.html'
		}).
		state('arqueos.view', {
			url: '/:arqueoId',
			templateUrl: 'modules/arqueos/views/view-arqueo.client.view.html'
		}).
		state('arqueos.edit', {
			url: '/:arqueoId/edit',
			templateUrl: 'modules/arqueos/views/edit-arqueo.client.view.html'
		});
	}
]);