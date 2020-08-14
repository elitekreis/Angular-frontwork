(function () {
  'use strict';

  describe('Pagos Route Tests', function () {
    // Initialize global variables
    var $scope,
      PagosService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _PagosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      PagosService = _PagosService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('pagos');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/pagos');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          PagosController,
          mockPago;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('pagos.view');
          $templateCache.put('modules/pagos/client/views/view-pago.client.view.html', '');

          // create mock Pago
          mockPago = new PagosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Pago Name'
          });

          // Initialize Controller
          PagosController = $controller('PagosController as vm', {
            $scope: $scope,
            pagoResolve: mockPago
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:pagoId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.pagoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            pagoId: 1
          })).toEqual('/pagos/1');
        }));

        it('should attach an Pago to the controller scope', function () {
          expect($scope.vm.pago._id).toBe(mockPago._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/pagos/client/views/view-pago.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          PagosController,
          mockPago;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('pagos.create');
          $templateCache.put('modules/pagos/client/views/form-pago.client.view.html', '');

          // create mock Pago
          mockPago = new PagosService();

          // Initialize Controller
          PagosController = $controller('PagosController as vm', {
            $scope: $scope,
            pagoResolve: mockPago
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.pagoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/pagos/create');
        }));

        it('should attach an Pago to the controller scope', function () {
          expect($scope.vm.pago._id).toBe(mockPago._id);
          expect($scope.vm.pago._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/pagos/client/views/form-pago.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          PagosController,
          mockPago;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('pagos.edit');
          $templateCache.put('modules/pagos/client/views/form-pago.client.view.html', '');

          // create mock Pago
          mockPago = new PagosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Pago Name'
          });

          // Initialize Controller
          PagosController = $controller('PagosController as vm', {
            $scope: $scope,
            pagoResolve: mockPago
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:pagoId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.pagoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            pagoId: 1
          })).toEqual('/pagos/1/edit');
        }));

        it('should attach an Pago to the controller scope', function () {
          expect($scope.vm.pago._id).toBe(mockPago._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/pagos/client/views/form-pago.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
