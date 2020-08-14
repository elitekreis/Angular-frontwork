'use strict';

// Configuring the Comprobantes module
angular.module('movimientos').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Movimiento',
			state: 'movimiento',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'movimientos', {
			title: 'List movimientos',
			state: 'movimientos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'movimientos', {
			title: 'Create Movimiento',
			state: 'movimientos.create'
		});
	}
]);