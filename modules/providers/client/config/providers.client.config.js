'use strict';

// Configuring the Providers module
angular.module('providers').run(['Menus',
	function(Menus) {
		// Add the Providers dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Providers',
			state: 'providers',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'providers', {
			title: 'List Providers',
			state: 'providers.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'providers', {
			title: 'Create Provider',
			state: 'providers.create'
		});
	}
]);