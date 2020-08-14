'use strict';

// Configuring the Procesos module
angular.module('procesos').run(['Menus',
	function(Menus) {
		// Add the Procesos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Procesos',
			state: 'procesos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'procesos', {
			title: 'List Procesos',
			state: 'procesos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'procesos', {
			title: 'Create Proceso',
			state: 'procesos.create'
		});
	}
]);