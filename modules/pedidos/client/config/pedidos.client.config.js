'use strict';

// Configuring the Pedidos module
angular.module('pedidos').run(['Menus',
	function(Menus) {
		// Add the Pedidos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Pedidos',
			state: 'pedidos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'pedidos', {
			title: 'List Pedidos',
			state: 'pedidos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'pedidos', {
			title: 'Create Pedido',
			state: 'pedidos.create'
		});
	}
]);