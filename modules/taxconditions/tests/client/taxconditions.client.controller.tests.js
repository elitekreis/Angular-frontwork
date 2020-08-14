'use strict';

(function() {
	// Taxconditions Controller Spec
	describe('Taxconditions Controller Tests', function() {
		// Initialize global variables
		var TaxconditionsController,
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

			// Initialize the Taxconditions controller.
			TaxconditionsController = $controller('TaxconditionsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Taxcondition object fetched from XHR', inject(function(Taxconditions) {
			// Create sample Taxcondition using the Taxconditions service
			var sampleTaxcondition = new Taxconditions({
				name: 'New Taxcondition'
			});

			// Create a sample Taxconditions array that includes the new Taxcondition
			var sampleTaxconditions = [sampleTaxcondition];

			// Set GET response
			$httpBackend.expectGET('api/taxconditions').respond(sampleTaxconditions);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.taxconditions).toEqualData(sampleTaxconditions);
		}));

		it('$scope.findOne() should create an array with one Taxcondition object fetched from XHR using a taxconditionId URL parameter', inject(function(Taxconditions) {
			// Define a sample Taxcondition object
			var sampleTaxcondition = new Taxconditions({
				name: 'New Taxcondition'
			});

			// Set the URL parameter
			$stateParams.taxconditionId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/taxconditions\/([0-9a-fA-F]{24})$/).respond(sampleTaxcondition);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.taxcondition).toEqualData(sampleTaxcondition);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Taxconditions) {
			// Create a sample Taxcondition object
			var sampleTaxconditionPostData = new Taxconditions({
				name: 'New Taxcondition'
			});

			// Create a sample Taxcondition response
			var sampleTaxconditionResponse = new Taxconditions({
				_id: '525cf20451979dea2c000001',
				name: 'New Taxcondition'
			});

			// Fixture mock form input values
			scope.name = 'New Taxcondition';

			// Set POST response
			$httpBackend.expectPOST('api/taxconditions', sampleTaxconditionPostData).respond(sampleTaxconditionResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Taxcondition was created
			expect($location.path()).toBe('/taxconditions/' + sampleTaxconditionResponse._id);
		}));

		it('$scope.update() should update a valid Taxcondition', inject(function(Taxconditions) {
			// Define a sample Taxcondition put data
			var sampleTaxconditionPutData = new Taxconditions({
				_id: '525cf20451979dea2c000001',
				name: 'New Taxcondition'
			});

			// Mock Taxcondition in scope
			scope.taxcondition = sampleTaxconditionPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/taxconditions\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/taxconditions/' + sampleTaxconditionPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid taxconditionId and remove the Taxcondition from the scope', inject(function(Taxconditions) {
			// Create new Taxcondition object
			var sampleTaxcondition = new Taxconditions({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Taxconditions array and include the Taxcondition
			scope.taxconditions = [sampleTaxcondition];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/taxconditions\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleTaxcondition);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.taxconditions.length).toBe(0);
		}));
	});
}());