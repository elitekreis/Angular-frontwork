'use strict';

// Configuring the liquidaciones module
angular.module('liquidaciones').run(['Menus',
	function(Menus) {
		// Add the liquidaciones dropdown item
		Menus.addMenuItem('topbar', {
			title: 'liquidaciones',
			state: 'liquidaciones',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'liquidaciones', {
			title: 'List liquidaciones',
			state: 'liquidaciones.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'liquidaciones', {
			title: 'Create Liquidacion',
			state: 'liquidaciones.create'
		});
	}
]);