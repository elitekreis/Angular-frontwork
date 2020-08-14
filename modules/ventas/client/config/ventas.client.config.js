'use strict';

// Configuring the Ventas module
angular.module('ventas').run(['Menus',
	function(Menus) {
		// Add the Ventas dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Ventas',
			state: 'ventas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'ventas', {
			title: 'List Ventas',
			state: 'ventas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'ventas', {
			title: 'Create Venta',
			state: 'ventas.create'
		});
	}
]);