'use strict';

// Setting up route
angular.module('tareas').config(['$stateProvider',
	function($stateProvider) {
		// Tareas state routing
		$stateProvider.
		state('tareas', {
			abstract: true,
			url: '/tareas',
			template: '<ui-view/>'
		}).
		state('tareas.list', {
			url: '',
			templateUrl: 'modules/tareas/views/list-tareas.client.view.html'
		}).
		state('tareas.create', {
			url: '/create',
			templateUrl: 'modules/tareas/views/create-tarea.client.view.html'
		}).
		state('tareas.view', {
			url: '/:tareaId',
			templateUrl: 'modules/tareas/views/view-tarea.client.view.html'
		}).
		state('tareas.edit', {
			url: '/:tareaId/edit',
			templateUrl: 'modules/tareas/views/edit-tarea.client.view.html'
		});
	}
]);