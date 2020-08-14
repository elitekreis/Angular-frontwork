'use strict';

// Configuring the Comprobantes module
angular.module('sucursales').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Sucursales',
			state: 'sucursales',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'sucursales', {
			title: 'List Sucursales',
			state: 'sucursales.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'sucursales', {
			title: 'Create Sucursal',
			state: 'sucursales.create'
		});
	}
]);