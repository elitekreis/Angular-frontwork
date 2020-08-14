(function () {
  'use strict';

  describe('Costosindirectos Route Tests', function () {
    // Initialize global variables
    var $scope,
      CostosindirectosService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _CostosindirectosService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      CostosindirectosService = _CostosindirectosService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('costosindirectos');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/costosindirectos');
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
          CostosindirectosController,
          mockCostosindirecto;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('costosindirectos.view');
          $templateCache.put('modules/costosindirectos/client/views/view-costosindirecto.client.view.html', '');

          // create mock Costosindirecto
          mockCostosindirecto = new CostosindirectosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Costosindirecto Name'
          });

          // Initialize Controller
          CostosindirectosController = $controller('CostosindirectosController as vm', {
            $scope: $scope,
            costosindirectoResolve: mockCostosindirecto
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:costosindirectoId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.costosindirectoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            costosindirectoId: 1
          })).toEqual('/costosindirectos/1');
        }));

        it('should attach an Costosindirecto to the controller scope', function () {
          expect($scope.vm.costosindirecto._id).toBe(mockCostosindirecto._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/costosindirectos/client/views/view-costosindirecto.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          CostosindirectosController,
          mockCostosindirecto;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('costosindirectos.create');
          $templateCache.put('modules/costosindirectos/client/views/form-costosindirecto.client.view.html', '');

          // create mock Costosindirecto
          mockCostosindirecto = new CostosindirectosService();

          // Initialize Controller
          CostosindirectosController = $controller('CostosindirectosController as vm', {
            $scope: $scope,
            costosindirectoResolve: mockCostosindirecto
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.costosindirectoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/costosindirectos/create');
        }));

        it('should attach an Costosindirecto to the controller scope', function () {
          expect($scope.vm.costosindirecto._id).toBe(mockCostosindirecto._id);
          expect($scope.vm.costosindirecto._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/costosindirectos/client/views/form-costosindirecto.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          CostosindirectosController,
          mockCostosindirecto;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('costosindirectos.edit');
          $templateCache.put('modules/costosindirectos/client/views/form-costosindirecto.client.view.html', '');

          // create mock Costosindirecto
          mockCostosindirecto = new CostosindirectosService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Costosindirecto Name'
          });

          // Initialize Controller
          CostosindirectosController = $controller('CostosindirectosController as vm', {
            $scope: $scope,
            costosindirectoResolve: mockCostosindirecto
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:costosindirectoId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.costosindirectoResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            costosindirectoId: 1
          })).toEqual('/costosindirectos/1/edit');
        }));

        it('should attach an Costosindirecto to the controller scope', function () {
          expect($scope.vm.costosindirecto._id).toBe(mockCostosindirecto._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/costosindirectos/client/views/form-costosindirecto.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
