'use strict';

(function() {
	// Enterprises Controller Spec
	describe('Enterprises Controller Tests', function() {
		// Initialize global variables
		var EnterprisesController,
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

			// Initialize the Enterprises controller.
			EnterprisesController = $controller('EnterprisesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Enterprise object fetched from XHR', inject(function(Enterprises) {
			// Create sample Enterprise using the Enterprises service
			var sampleEnterprise = new Enterprises({
				name: 'New Enterprise'
			});

			// Create a sample Enterprises array that includes the new Enterprise
			var sampleEnterprises = [sampleEnterprise];

			// Set GET response
			$httpBackend.expectGET('api/enterprises').respond(sampleEnterprises);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.enterprises).toEqualData(sampleEnterprises);
		}));

		it('$scope.findOne() should create an array with one Enterprise object fetched from XHR using a enterpriseId URL parameter', inject(function(Enterprises) {
			// Define a sample Enterprise object
			var sampleEnterprise = new Enterprises({
				name: 'New Enterprise'
			});

			// Set the URL parameter
			$stateParams.enterpriseId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/enterprises\/([0-9a-fA-F]{24})$/).respond(sampleEnterprise);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.enterprise).toEqualData(sampleEnterprise);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Enterprises) {
			// Create a sample Enterprise object
			var sampleEnterprisePostData = new Enterprises({
				name: 'New Enterprise'
			});

			// Create a sample Enterprise response
			var sampleEnterpriseResponse = new Enterprises({
				_id: '525cf20451979dea2c000001',
				name: 'New Enterprise'
			});

			// Fixture mock form input values
			scope.name = 'New Enterprise';

			// Set POST response
			$httpBackend.expectPOST('api/enterprises', sampleEnterprisePostData).respond(sampleEnterpriseResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Enterprise was created
			expect($location.path()).toBe('/enterprises/' + sampleEnterpriseResponse._id);
		}));

		it('$scope.update() should update a valid Enterprise', inject(function(Enterprises) {
			// Define a sample Enterprise put data
			var sampleEnterprisePutData = new Enterprises({
				_id: '525cf20451979dea2c000001',
				name: 'New Enterprise'
			});

			// Mock Enterprise in scope
			scope.enterprise = sampleEnterprisePutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/enterprises\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/enterprises/' + sampleEnterprisePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid enterpriseId and remove the Enterprise from the scope', inject(function(Enterprises) {
			// Create new Enterprise object
			var sampleEnterprise = new Enterprises({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Enterprises array and include the Enterprise
			scope.enterprises = [sampleEnterprise];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/enterprises\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleEnterprise);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.enterprises.length).toBe(0);
		}));
	});
}());