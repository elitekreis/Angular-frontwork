'use strict';

(function() {
	// Entregas Controller Spec
	describe('Entregas Controller Tests', function() {
		// Initialize global variables
		var EntregasController,
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

			// Initialize the Entregas controller.
			EntregasController = $controller('EntregasController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Entrega object fetched from XHR', inject(function(Entregas) {
			// Create sample Entrega using the Entregas service
			var sampleEntrega = new Entregas({
				name: 'New Entrega'
			});

			// Create a sample Entregas array that includes the new Entrega
			var sampleEntregas = [sampleEntrega];

			// Set GET response
			$httpBackend.expectGET('api/entregas').respond(sampleEntregas);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.entregas).toEqualData(sampleEntregas);
		}));

		it('$scope.findOne() should create an array with one Entrega object fetched from XHR using a entregaId URL parameter', inject(function(Entregas) {
			// Define a sample Entrega object
			var sampleEntrega = new Entregas({
				name: 'New Entrega'
			});

			// Set the URL parameter
			$stateParams.entregaId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/entregas\/([0-9a-fA-F]{24})$/).respond(sampleEntrega);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.entrega).toEqualData(sampleEntrega);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Entregas) {
			// Create a sample Entrega object
			var sampleEntregaPostData = new Entregas({
				name: 'New Entrega'
			});

			// Create a sample Entrega response
			var sampleEntregaResponse = new Entregas({
				_id: '525cf20451979dea2c000001',
				name: 'New Entrega'
			});

			// Fixture mock form input values
			scope.name = 'New Entrega';

			// Set POST response
			$httpBackend.expectPOST('api/entregas', sampleEntregaPostData).respond(sampleEntregaResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Entrega was created
			expect($location.path()).toBe('/entregas/' + sampleEntregaResponse._id);
		}));

		it('$scope.update() should update a valid Entrega', inject(function(Entregas) {
			// Define a sample Entrega put data
			var sampleEntregaPutData = new Entregas({
				_id: '525cf20451979dea2c000001',
				name: 'New Entrega'
			});

			// Mock Entrega in scope
			scope.entrega = sampleEntregaPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/entregas\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/entregas/' + sampleEntregaPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid entregaId and remove the Entrega from the scope', inject(function(Entregas) {
			// Create new Entrega object
			var sampleEntrega = new Entregas({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Entregas array and include the Entrega
			scope.entregas = [sampleEntrega];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/entregas\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleEntrega);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.entregas.length).toBe(0);
		}));
	});
}());