'use strict';

// Configuring the Condicionventas module
angular.module('condicionventas').run(['Menus',
	function(Menus) {
		// Add the Condicionventas dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Condicionventas',
			state: 'condicionventas',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'condicionventas', {
			title: 'List Condicionventas',
			state: 'condicionventas.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'condicionventas', {
			title: 'Create Condicionventa',
			state: 'condicionventas.create'
		});
	}
]);