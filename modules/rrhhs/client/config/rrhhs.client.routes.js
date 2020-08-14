'use strict';

//Setting up route
angular.module('rrhhs').config(['$stateProvider',
	function($stateProvider) {
		// Rrhhs state routing
		$stateProvider.
		state('rrhhs', {
			abstract: true,
			url: '/rrhhs',
			template: '<ui-view/>'
		}).
		state('rrhhs.list', {
			url: '',
			templateUrl: 'modules/rrhhs/views/list-rrhhs.client.view.html'
		}).
		state('rrhhs.create', {
			url: '/create',
			templateUrl: 'modules/rrhhs/views/create-rrhh.client.view.html'
		}).
		state('rrhhs.view', {
			url: '/:rrhhId',
			templateUrl: 'modules/rrhhs/views/view-rrhh.client.view.html'
		}).
		state('rrhhs.edit', {
			url: '/:rrhhId/edit',
			templateUrl: 'modules/rrhhs/views/edit-rrhh.client.view.html'
		});
	}
]);