'use strict';

// Configuring the Comprobantes module
angular.module('arqueos').run(['Menus',
	function(Menus) {
		// Add the Comprobantes dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Arqueos',
			state: 'arqueos',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'arqueos', {
			title: 'List Arqueos',
			state: 'arqueos.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'arqueos', {
			title: 'Create Caja',
			state: 'arqueos.create'
		});
	}
]);