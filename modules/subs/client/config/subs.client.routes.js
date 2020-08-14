'use strict';

//Setting up route
angular.module('subs').config(['$stateProvider',
	function($stateProvider) {
		// Subs state routing
		$stateProvider.
		state('subs', {
			abstract: true,
			url: '/subs',
			template: '<ui-view/>'
		}).
		state('subs.list', {
			url: '',
			templateUrl: 'modules/subs/views/list-subs.client.view.html'
		}).
		state('subs.create', {
			url: '/create',
			templateUrl: 'modules/subs/views/create-sub.client.view.html'
		}).
		state('subs.view', {
			url: '/:subId',
			templateUrl: 'modules/subs/views/view-sub.client.view.html'
		}).
		state('subs.edit', {
			url: '/:subId/edit',
			templateUrl: 'modules/subs/views/edit-sub.client.view.html'
		});
	}
]);