'use strict';

//Setting up route
angular.module('reportes').config(['$stateProvider',
	function($stateProvider) {
		// Ventas state routing
		$stateProvider.
		state('reportes', {
			abstract: true,
			url: '/reportes',
			template: '<ui-view/>'
		}).
		state('reportes.list', {
			url: '',
			templateUrl: 'modules/reportes/views/dashboard-reportes.client.view.html'
		}).
		state('reportes.create', {
			url: '/create',
			templateUrl: 'modules/reportes/views/create-reporte.client.view.html'
		}).
		state('reportes.view', {
			url: '/:reporteId',
			templateUrl: 'modules/reportes/views/view-reporte.client.view.html'
		}).
		state('reportes.edit', {
			url: '/:reporteId/edit',
			templateUrl: 'modules/reportes/views/edit-reporte.client.view.html'
		});
	}
]);
