'use strict';

// Configuring the Procesos module
angular.module('procedimientos').run(['Menus',
	function(Menus) {
		// Add the Procesos dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Procedimientos',
			state: 'procedimientos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'procedimientos', {
			title: 'List Procedimientos',
			state: 'procedimientos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'procedimientos', {
			title: 'Create Procedimiento',
			state: 'procedimiento.create'
		});
	}
]);