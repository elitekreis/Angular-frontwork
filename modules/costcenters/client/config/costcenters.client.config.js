'use strict';

// Configuring the Costcenters module
angular.module('costcenters').run(['Menus',
	function(Menus) {
		// Add the Costcenters dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Costcenters',
			state: 'costcenters',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'costcenters', {
			title: 'List Costcenters',
			state: 'costcenters.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'costcenters', {
			title: 'Create Costcenter',
			state: 'costcenters.create'
		});
	}
]);