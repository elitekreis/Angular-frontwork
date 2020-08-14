'use strict';

// Configuring the Products module
angular.module('products').run(['Menus',
	function(Menus) {
		// Add the Products dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Products',
			state: 'products',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'products', {
			title: 'List Products',
			state: 'products.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'products', {
			title: 'Create Product',
			state: 'products.create'
		});
	}
]);