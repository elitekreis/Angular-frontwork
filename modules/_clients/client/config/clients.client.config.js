'use strict';

// Configuring the Clients module
angular.module('clients').run(['Menus',
	function(Menus) {
		// Add the Clients dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Clients',
			state: 'clients',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'clients', {
			title: 'List Clients',
			state: 'clients.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'clients', {
			title: 'Create Client',
			state: 'clients.create'
		});
	}
]);