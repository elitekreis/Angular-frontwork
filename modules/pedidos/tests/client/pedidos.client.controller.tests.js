'use strict';

(function() {
	// Pedidos Controller Spec
	describe('Pedidos Controller Tests', function() {
		// Initialize global variables
		var PedidosController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Pedidos controller.
			PedidosController = $controller('PedidosController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Pedido object fetched from XHR', inject(function(Pedidos) {
			// Create sample Pedido using the Pedidos service
			var samplePedido = new Pedidos({
				name: 'New Pedido'
			});

			// Create a sample Pedidos array that includes the new Pedido
			var samplePedidos = [samplePedido];

			// Set GET response
			$httpBackend.expectGET('api/pedidos').respond(samplePedidos);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.pedidos).toEqualData(samplePedidos);
		}));

		it('$scope.findOne() should create an array with one Pedido object fetched from XHR using a pedidoId URL parameter', inject(function(Pedidos) {
			// Define a sample Pedido object
			var samplePedido = new Pedidos({
				name: 'New Pedido'
			});

			// Set the URL parameter
			$stateParams.pedidoId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/pedidos\/([0-9a-fA-F]{24})$/).respond(samplePedido);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.pedido).toEqualData(samplePedido);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Pedidos) {
			// Create a sample Pedido object
			var samplePedidoPostData = new Pedidos({
				name: 'New Pedido'
			});

			// Create a sample Pedido response
			var samplePedidoResponse = new Pedidos({
				_id: '525cf20451979dea2c000001',
				name: 'New Pedido'
			});

			// Fixture mock form input values
			scope.name = 'New Pedido';

			// Set POST response
			$httpBackend.expectPOST('api/pedidos', samplePedidoPostData).respond(samplePedidoResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Pedido was created
			expect($location.path()).toBe('/pedidos/' + samplePedidoResponse._id);
		}));

		it('$scope.update() should update a valid Pedido', inject(function(Pedidos) {
			// Define a sample Pedido put data
			var samplePedidoPutData = new Pedidos({
				_id: '525cf20451979dea2c000001',
				name: 'New Pedido'
			});

			// Mock Pedido in scope
			scope.pedido = samplePedidoPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/pedidos\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/pedidos/' + samplePedidoPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid pedidoId and remove the Pedido from the scope', inject(function(Pedidos) {
			// Create new Pedido object
			var samplePedido = new Pedidos({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Pedidos array and include the Pedido
			scope.pedidos = [samplePedido];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/pedidos\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(samplePedido);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.pedidos.length).toBe(0);
		}));
	});
}());