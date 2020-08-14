//Empleados service used to communicate Empleados REST endpoints
(function () {
  'use strict';

  angular
    .module('empleados')
    .factory('Empleados', Empleados);
    

  Empleados.$inject = ['$resource'];

  function Empleados($resource) {
    return $resource('api/empleados/:empleadoId', {
      empleadoId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
})();

// 'use strict';

// //Costcenters service used to communicate Costcenters REST endpoints
// angular.module('empleados').factory('Empleados', ['$resource',
//   function($resource) {
//     return $resource('api/empleados/:empleadoId', { empleadoId: '@_id'
//     }, {
//       update: {
//         method: 'PUT'
//       }
//     });
//   }
// ]);
