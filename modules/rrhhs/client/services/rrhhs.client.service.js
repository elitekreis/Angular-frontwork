'use strict';

//Rrhhs service used to communicate Rrhhs REST endpoints
angular.module('rrhhs').factory('Rrhhs', ['$resource',
	function($resource) {
		return $resource('api/rrhhs/:rrhhId', { rrhhId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('ShowAreaInfo', function() {    
	var actualArea;            
	return{
	    getArea: function(){           
	      return actualArea;
	    },
	    setArea: function(id){           
	      actualArea = id;
	    },
	}
});