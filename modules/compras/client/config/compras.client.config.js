'use strict';

// Configuring the Compras module
angular.module('compras').run(['Menus',
	function(Menus) {
		// Add the Compras dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Compras',
			state: 'compras',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'compras', {
			title: 'List Compras',
			state: 'compras.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'compras', {
			title: 'Create Compra',
			state: 'compras.create'
		});
	}
]);