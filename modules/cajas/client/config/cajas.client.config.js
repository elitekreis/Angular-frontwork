'use strict';

// Configuring the Comprobantes module
angular.module('cajas').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Cajas',
			state: 'cajas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'cajas', {
			title: 'List Cajas',
			state: 'cajas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'cajas', {
			title: 'Create Caja',
			state: 'cajas.create'
		});
	}
]);