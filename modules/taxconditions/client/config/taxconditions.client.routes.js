'use strict';

//Setting up route
angular.module('taxconditions').config(['$stateProvider',
	function($stateProvider) {
		// Taxconditions state routing
		$stateProvider.
		state('taxconditions', {
			abstract: true,
			url: '/taxconditions',
			template: '<ui-view/>'
		}).
		state('taxconditions.list', {
			url: '',
			templateUrl: 'modules/taxconditions/views/list-taxconditions.client.view.html'
		}).
		state('taxconditions.create', {
			url: '/create',
			templateUrl: 'modules/taxconditions/views/create-taxcondition.client.view.html'
		}).
		state('taxconditions.view', {
			url: '/:taxconditionId',
			templateUrl: 'modules/taxconditions/views/view-taxcondition.client.view.html'
		}).
		state('taxconditions.edit', {
			url: '/:taxconditionId/edit',
			templateUrl: 'modules/taxconditions/views/edit-taxcondition.client.view.html'
		});
	}
]);