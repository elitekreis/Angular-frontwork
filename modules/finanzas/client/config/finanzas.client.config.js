'use strict';

// Configuring the Comprobantes module
angular.module('finanzas').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Finanzas',
			state: 'finanzas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'finanzas', {
			title: 'List Finanzas',
			state: 'finanzas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'finanzas', {
			title: 'Create Finanza',
			state: 'finanzas.create'
		});
	}
]);