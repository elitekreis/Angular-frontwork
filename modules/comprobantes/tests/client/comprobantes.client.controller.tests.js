'use strict';

(function() {
	// Comprobantes Controller Spec
	describe('Comprobantes Controller Tests', function() {
		// Initialize global variables
		var ComprobantesController,
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

			// Initialize the Comprobantes controller.
			ComprobantesController = $controller('ComprobantesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Comprobante object fetched from XHR', inject(function(Comprobantes) {
			// Create sample Comprobante using the Comprobantes service
			var sampleComprobante = new Comprobantes({
				name: 'New Comprobante'
			});

			// Create a sample Comprobantes array that includes the new Comprobante
			var sampleComprobantes = [sampleComprobante];

			// Set GET response
			$httpBackend.expectGET('api/comprobantes').respond(sampleComprobantes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.comprobantes).toEqualData(sampleComprobantes);
		}));

		it('$scope.findOne() should create an array with one Comprobante object fetched from XHR using a comprobanteId URL parameter', inject(function(Comprobantes) {
			// Define a sample Comprobante object
			var sampleComprobante = new Comprobantes({
				name: 'New Comprobante'
			});

			// Set the URL parameter
			$stateParams.comprobanteId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/comprobantes\/([0-9a-fA-F]{24})$/).respond(sampleComprobante);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.comprobante).toEqualData(sampleComprobante);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Comprobantes) {
			// Create a sample Comprobante object
			var sampleComprobantePostData = new Comprobantes({
				name: 'New Comprobante'
			});

			// Create a sample Comprobante response
			var sampleComprobanteResponse = new Comprobantes({
				_id: '525cf20451979dea2c000001',
				name: 'New Comprobante'
			});

			// Fixture mock form input values
			scope.name = 'New Comprobante';

			// Set POST response
			$httpBackend.expectPOST('api/comprobantes', sampleComprobantePostData).respond(sampleComprobanteResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Comprobante was created
			expect($location.path()).toBe('/comprobantes/' + sampleComprobanteResponse._id);
		}));

		it('$scope.update() should update a valid Comprobante', inject(function(Comprobantes) {
			// Define a sample Comprobante put data
			var sampleComprobantePutData = new Comprobantes({
				_id: '525cf20451979dea2c000001',
				name: 'New Comprobante'
			});

			// Mock Comprobante in scope
			scope.comprobante = sampleComprobantePutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/comprobantes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/comprobantes/' + sampleComprobantePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid comprobanteId and remove the Comprobante from the scope', inject(function(Comprobantes) {
			// Create new Comprobante object
			var sampleComprobante = new Comprobantes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Comprobantes array and include the Comprobante
			scope.comprobantes = [sampleComprobante];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/comprobantes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleComprobante);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.comprobantes.length).toBe(0);
		}));
	});
}());