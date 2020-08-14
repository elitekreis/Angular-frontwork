(function () {
  'use strict';

  angular
    .module('pagos')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('pagos', {
        abstract: true,
        url: '/pagos',
        template: '<ui-view/>'
      })
      .state('pagos.list', {
        url: '',
        templateUrl: 'modules/pagos/client/views/list-pagos.client.view.html',
        controller: 'PagosListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Pagos List'
        }
      })
      .state('pagos.create', {
        url: '/create',
        templateUrl: 'modules/pagos/client/views/form-pago.client.view.html',
        controller: 'PagosController',
        controllerAs: 'vm',
        resolve: {
          pagoResolve: newPago
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Pagos Create'
        }
      })
      .state('pagos.edit', {
        url: '/:pagoId/edit',
        templateUrl: 'modules/pagos/client/views/form-pago.client.view.html',
        controller: 'PagosController',
        controllerAs: 'vm',
        resolve: {
          pagoResolve: getPago
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Pago {{ pagoResolve.name }}'
        }
      })
      .state('pagos.view', {
        url: '/:pagoId',
        templateUrl: 'modules/pagos/client/views/view-pago.client.view.html',
        controller: 'PagosController',
        controllerAs: 'vm',
        resolve: {
          pagoResolve: getPago
        },
        data: {
          pageTitle: 'Pago {{ pagoResolve.name }}'
        }
      })
      .state('pagos.saldo', {
        url: '/:saldoId',
        templateUrl: 'modules/pagos/client/views/view-saldo.client.view.html',
        controller: 'PagosController',
        controllerAs: 'vm',
        resolve: {
          pagoResolve: getPago
        },
        data: {
          pageTitle: 'Saldo {{ pagoResolve.name }}'
        }
      });
  }

  getPago.$inject = ['$stateParams', 'PagosService'];

  function getPago($stateParams, PagosService) {
    return PagosService.get({
      pagoId: $stateParams.pagoId
    }).$promise;
  }

  newPago.$inject = ['PagosService'];

  function newPago(PagosService) {
    return new PagosService();
  }
}());
