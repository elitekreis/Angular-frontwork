'use strict';

// Configuring the Taxconditions module
angular.module('taxconditions').run(['Menus',
	function(Menus) {
		// Add the Taxconditions dropdown item
		Menus.addMenuItem('topbar', {
			title: 'Taxconditions',
			state: 'taxconditions',
			type: 'dropdown'
		});

		// Add the dropdown list item
		Menus.addSubMenuItem('topbar', 'taxconditions', {
			title: 'List Taxconditions',
			state: 'taxconditions.list'
		});

		// Add the dropdown create item
		Menus.addSubMenuItem('topbar', 'taxconditions', {
			title: 'Create Taxcondition',
			state: 'taxconditions.create'
		});
	}
]);