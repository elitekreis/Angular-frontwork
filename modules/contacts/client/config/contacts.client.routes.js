'use strict';

//Setting up route
angular.module('contacts').config(['$stateProvider',
	function($stateProvider) {
		// Contacts state routing
		$stateProvider.
		state('contacts', {
			abstract: true,
			url: '/contacts',
			template: '<ui-view/>'
		}).
		state('contacts.list', {
			url: '',
			templateUrl: 'modules/contacts/views/list-contacts.client.view.html'
		}).
		state('contacts.create', {
			url: '/create',
			templateUrl: 'modules/contacts/views/create-contact.client.view.html'
		}).
		state('contacts.view', {
			url: '/:contactId',
			templateUrl: 'modules/contacts/views/view-contact.client.view.html'
		}).
		state('contacts.edit', {
			url: '/:contactId/edit',
			templateUrl: 'modules/contacts/views/edit-contact.client.view.html'
		});
	}
]);