'use strict';

//Setting up route
angular.module('stocks').config(['$stateProvider',
	function($stateProvider) {
		// Stocks state routing
		$stateProvider.
		state('stocks', {
			abstract: true,
			url: '/stocks',
			template: '<ui-view/>'
		}).
		state('stocks.list', {
			url: '',
			templateUrl: 'modules/stocks/views/list-stocks.client.view.html'
		}).
		state('stocks.create', {
			url: '/create',
			templateUrl: 'modules/stocks/views/create-stock.client.view.html'
		}).
		state('stocks.view', {
			url: '/:stockId',
			templateUrl: 'modules/stocks/views/view-stock.client.view.html'
		}).
		state('stocks.edit', {
			url: '/:stockId/edit',
			templateUrl: 'modules/stocks/views/edit-stock.client.view.html'
		});
	}
]);