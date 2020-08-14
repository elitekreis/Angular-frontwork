'use strict';

//Comprobantes service used to communicate Comprobantes REST endpoints
angular.module('sucursales')
.factory('Sucursales', ['$resource',
	function($resource) {
		return $resource('api/sucursales/:sucursalId', { sucursalId: '@_id', e: '@enterprise'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]).factory('ServiceNavigation', ['$location',
  function($location) {
  	var inneNavList = [];
  	return {
  		addNav : function(navObj) { 
  		  if(inneNavList.length > 0) { 			
          var elempos = inneNavList.map(function(x){return x.name}).indexOf(navObj.name);
          if(elempos === -1)
          	inneNavList.push(navObj);
        } else {
        	inneNavList.push(navObj);
        }         
          
        window.localStorage.setItem("subNav",JSON.stringify(inneNavList));            	
		  },
		  getNav : function() {        
		  	return (inneNavList.length > 0 ) ? inneNavList : JSON.parse(window.localStorage.getItem("subNav"));
		  },
		  navInit: function(val){
        if(val === "single"){
          inneNavList.splice(0);
          return;
        }
       inneNavList.splice(0);
       window.localStorage.removeItem("subNav");
		  },
		  back: function() {		  	
		  	if(window.localStorage.getItem("subNav")){
		  		inneNavList = JSON.parse(window.localStorage.getItem("subNav"))
  				window.localStorage.removeItem("subNav");
  			}      
		  	inneNavList.splice(inneNavList.length - 1, 1);
		  	window.localStorage.setItem("subNav",JSON.stringify(inneNavList)); 
		  },
      unIntended: false
  	}
  }
]);
