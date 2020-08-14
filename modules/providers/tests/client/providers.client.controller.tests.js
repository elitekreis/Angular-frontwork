'use strict';

(function() {
	// Providers Controller Spec
	describe('Providers Controller Tests', function() {
		// Initialize global variables
		var ProvidersController,
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

			// Initialize the Providers controller.
			ProvidersController = $controller('ProvidersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Provider object fetched from XHR', inject(function(Providers) {
			// Create sample Provider using the Providers service
			var sampleProvider = new Providers({
				name: 'New Provider'
			});

			// Create a sample Providers array that includes the new Provider
			var sampleProviders = [sampleProvider];

			// Set GET response
			$httpBackend.expectGET('api/providers').respond(sampleProviders);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.providers).toEqualData(sampleProviders);
		}));

		it('$scope.findOne() should create an array with one Provider object fetched from XHR using a providerId URL parameter', inject(function(Providers) {
			// Define a sample Provider object
			var sampleProvider = new Providers({
				name: 'New Provider'
			});

			// Set the URL parameter
			$stateParams.providerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/providers\/([0-9a-fA-F]{24})$/).respond(sampleProvider);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.provider).toEqualData(sampleProvider);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Providers) {
			// Create a sample Provider object
			var sampleProviderPostData = new Providers({
				name: 'New Provider'
			});

			// Create a sample Provider response
			var sampleProviderResponse = new Providers({
				_id: '525cf20451979dea2c000001',
				name: 'New Provider'
			});

			// Fixture mock form input values
			scope.name = 'New Provider';

			// Set POST response
			$httpBackend.expectPOST('api/providers', sampleProviderPostData).respond(sampleProviderResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Provider was created
			expect($location.path()).toBe('/providers/' + sampleProviderResponse._id);
		}));

		it('$scope.update() should update a valid Provider', inject(function(Providers) {
			// Define a sample Provider put data
			var sampleProviderPutData = new Providers({
				_id: '525cf20451979dea2c000001',
				name: 'New Provider'
			});

			// Mock Provider in scope
			scope.provider = sampleProviderPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/providers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/providers/' + sampleProviderPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid providerId and remove the Provider from the scope', inject(function(Providers) {
			// Create new Provider object
			var sampleProvider = new Providers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Providers array and include the Provider
			scope.providers = [sampleProvider];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/providers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleProvider);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.providers.length).toBe(0);
		}));
	});
}());