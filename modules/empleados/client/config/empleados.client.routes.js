(function () {
  'use strict';

  angular
    .module('empleados')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('empleados', {
        abstract: true,
        url: '/empleados',
        template: '<ui-view/>'
      })
      .state('empleados.create', {
        url: '/create',
        templateUrl: 'modules/empleados/client/views/form-empleado.client.view.html',
        controller: 'EmpleadosController',
        controllerAs: 'vm',
        resolve: {
          empleadoResolve: newEmpleado
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle : 'Empleados Create'
        }
      })
      .state('empleados.edit', {
        url: '/:empleadoId/edit',
        templateUrl: 'modules/empleados/client/views/form-empleado.client.view.html',
        controller: 'EmpleadosController',
        controllerAs: 'vm',
        resolve: {
          empleadoResolve: getEmpleado
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Empleado {{ empleadoResolve.name }}'
        }
      })
      .state('empleados.view', {
        url: '/:empleadoId',
        templateUrl: 'modules/empleados/client/views/view-empleado.client.view.html',
        controller: 'EmpleadosController',
        controllerAs: 'vm',
        resolve: {
          empleadoResolve: getEmpleado
        },
        data:{
          pageTitle: 'Empleado {{ articleResolve.name }}'
        }
      });
  }

  getEmpleado.$inject = ['$stateParams', 'EmpleadosService'];

  function getEmpleado($stateParams, EmpleadosService) {
    return EmpleadosService.get({
      empleadoId: $stateParams.empleadoId
    }).$promise;
  }

  newEmpleado.$inject = ['EmpleadosService'];

  function newEmpleado(EmpleadosService) {
    return new EmpleadosService();
  }
})();
