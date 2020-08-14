'use strict';

//Setting up route
angular.module('costosindirectos').config(['$stateProvider',
  function($stateProvider) {
    // Comprobantes state routing
    $stateProvider.
    state('costosindirectos', {
      abstract: true,
      url: '/costosindirectos',
      template: '<ui-view/>'
    }).
    state('costosindirectos.list', {
      url: '',
      templateUrl: 'modules/costosindirectos/client/views/list-costosindirectos.client.view.html'
    }).
    state('costosindirectos.create', {
      url: '/create',
      templateUrl: 'modules/costosindirectos/client/views/form-costosindirecto.client.view.html'
    }).
    state('costosindirectos.view', {
      url: '/:costosindirectoId',
      templateUrl: 'modules/costosindirectos/client/views/view-costosindirecto.client.view.html'
    }).
    state('costosindirectos.edit', {
      url: '/:costosindirectoId/edit',
      templateUrl: 'modules/costosindirectos/client/views/form-costosindirecto.client.view.html'
    })
  }
]);