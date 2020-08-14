'use strict';

// Configuring the Puestos module
angular.module('puestos').run(['Menus',
	function(Menus) {
		// Add the Puestos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Puestos',
			state: 'puestos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'puestos', {
			title: 'List Puestos',
			state: 'puestos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'puestos', {
			title: 'Create Puesto',
			state: 'puestos.create'
		});
	}
]);