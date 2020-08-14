'use strict';

//Setting up route
angular.module('impuestos').config(['$stateProvider',
    function($stateProvider) {
        // Rrhhs state routing
        $stateProvider.
        state('impuestos', {
            abstract: true,
            url: '/impuestos',
            template: '<ui-view/>'
        }).
        state('impuestos.list', {
            url: '',
            templateUrl: 'modules/impuestos/views/list-impuestos.client.view.html'
        }).
        state('impuestos.create', {
            url: '/create',
            templateUrl: 'modules/impuestos/views/create-impuesto.client.view.html'
        }).
        state('impuestos.view', {
            url: '/:impuestoId',
            templateUrl: 'modules/impuestos/views/view-impuesto.client.view.html'
        });
    }
]);