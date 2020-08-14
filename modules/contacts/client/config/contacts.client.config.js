'use strict';

// Configuring the Contacts module
angular.module('contacts').run(['Menus',
	function(Menus) {
		// Add the Contacts dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Contacts',
			state: 'contacts',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'contacts', {
			title: 'List Contacts',
			state: 'contacts.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'contacts', {
			title: 'Create Contact',
			state: 'contacts.create'
		});
	}
]);