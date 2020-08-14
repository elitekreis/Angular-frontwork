'use strict';

angular.module('core').filter('nospace', [
	function() {
		return function(value) {
        return (!value) ? '' : value.replace(/ /g, '');
      };
	}
]);