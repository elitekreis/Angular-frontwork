'use strict';

// Configuring the Rrhhs module
angular.module('rrhhs').run(['Menus',
	function(Menus) {
		// Add the Rrhhs dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Rrhhs',
			state: 'rrhhs',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'rrhhs', {
			title: 'List Rrhhs',
			state: 'rrhhs.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'rrhhs', {
			title: 'Create Rrhh',
			state: 'rrhhs.create'
		});
	}
]);