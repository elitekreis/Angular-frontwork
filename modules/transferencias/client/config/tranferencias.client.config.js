'use strict';

// Configuring the Comprobantes module
angular.module('transferencias').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Transferencias',
			state: 'transferencias',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'transferencias', {
			title: 'List Transferencias',
			state: 'transferencias.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'transferencias', {
			title: 'Create Transferencia',
			state: 'transferencias.create'
		});
	}
]);