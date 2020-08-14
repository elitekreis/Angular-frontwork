

'use strict';

//Setting up route
angular.module('servicios').config(['$stateProvider',
  function($stateProvider) {
    // Comprobantes state routing
    $stateProvider.
    state('servicios', {
      abstract: true,
      url: '/servicios',
      template: '<ui-view/>'
    }).
    state('servicios.create', {
      url: '/create',
      templateUrl: 'modules/servicios/client/views/create-servicio.client.view.html'
    })
  }
]);