'use strict';

// Configuring the Compras module
angular.module('historialCompras').run(['Menus',
	function(Menus) {
		// Add the Compras dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Historial Compras',
			state: 'historialCompras',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'historialCompras', {
			title: 'List Historial Compras',
			state: 'historialCompras.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'historialCompras', {
			title: 'Create Historial Compra',
			state: 'historialCompras.create'
		});
	}
]);