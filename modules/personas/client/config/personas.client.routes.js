'use strict';

//Setting up route
angular.module('personas').config(['$stateProvider',
	function($stateProvider) {
		// Personas state routing
		$stateProvider.
		state('personas', {
			abstract: true,
			url: '/personas__',
			template: '<ui-view/>'
		}).
		state('personas.list', {
			url: '',
			templateUrl: 'modules/personas/views/list-personas.client.view.html'
		}).
		state('personas.create', {
			url: '/create',
			templateUrl: 'modules/personas/views/create-persona.client.view.html'
		}).
		state('personas.view', {
			url: '/:personaId',
			templateUrl: 'modules/personas/views/view-persona.client.view.html'
		}).
		state('personas.edit', {
			url: '/:personaId/edit',
			templateUrl: 'modules/personas/views/edit-persona.client.view.html'
		});
	}
]);