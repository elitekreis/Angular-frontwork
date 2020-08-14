// Servicios service used to communicate Servicios REST endpoints
(function () {
  'use strict';

  angular
    .module('servicios')
    .factory('ServiciosService', ServiciosService);

  ServiciosService.$inject = ['$resource'];

  function ServiciosService($resource) {
    return $resource('api/servicios/:servicioId', {
      servicioId: '@_id', e: '@enterprise'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
angular.module('servicios').factory('CustomServicios', ['$http',
  function($http) {
    return {
      getCentroByServicios: function(e) {
        return $http({
          method: "get",
          url: "api/servicios/getCentroByServicios",
          params:{
            e:e
          }
        });
      },
    }
  }
]);