'use strict';

//Setting up route
angular.module('areas').config(['$stateProvider',
	function($stateProvider) {
		// Areas state routing
		$stateProvider.
		state('areas__', {
			abstract: true,
			url: '/areas__',
			template: '<ui-view/>'
		}).
		state('areas__.list', {
			url: '',
			templateUrl: 'modules/areas/views/list-areas.client.view.html'
		}).
		state('areas__.create', {
			url: '/create',
			templateUrl: 'modules/areas/views/create-area.client.view.html'
		}).
		state('areas__.view', {
			url: '/:areaId',
			templateUrl: 'modules/areas/views/view-area.client.view.html'
		}).
		state('areas__.edit', {
			url: '/:areaId/edit',
			templateUrl: 'modules/areas/views/edit-area.client.view.html'
		});
	}
]);