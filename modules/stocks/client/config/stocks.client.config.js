'use strict';

// Configuring the Stocks module
angular.module('stocks').run(['Menus',
	function(Menus) {
		// Add the Stocks dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Stocks',
			state: 'stocks',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'stocks', {
			title: 'List Stocks',
			state: 'stocks.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'stocks', {
			title: 'Create Stock',
			state: 'stocks.create'
		});
	}
]);