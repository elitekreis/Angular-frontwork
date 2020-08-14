'use strict';

// Comprobantes controller
angular.module('remuneraciones').controller('RemuneracioneViewController', ['user', 'remuneracione', 
	function(user, remuneracione) {

		this.user = user;
		this.remuneracione = remuneracione;

	}
]);