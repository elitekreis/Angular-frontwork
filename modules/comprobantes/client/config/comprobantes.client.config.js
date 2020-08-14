'use strict';

// Configuring the Comprobantes module
angular.module('comprobantes').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Comprobantes',
			state: 'comprobantes',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'comprobantes', {
			title: 'List Comprobantes',
			state: 'comprobantes.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'comprobantes', {
			title: 'Create Comprobante',
			state: 'comprobantes.create'
		});
	}
]);