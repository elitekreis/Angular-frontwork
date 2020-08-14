'use strict';

// Configuring the Enterprises module
angular.module('enterprises').run(['Menus',
	function(Menus) {
		// Add the Enterprises dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Enterprises',
			state: 'enterprises',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'enterprises', {
			title: 'List Enterprises',
			state: 'enterprises.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'enterprises', {
			title: 'Create Enterprise',
			state: 'enterprises.create'
		});
	}
]);