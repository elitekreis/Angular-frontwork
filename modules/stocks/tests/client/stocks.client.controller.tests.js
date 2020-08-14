'use strict';

(function() {
	// Stocks Controller Spec
	describe('Stocks Controller Tests', function() {
		// Initialize global variables
		var StocksController,
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

			// Initialize the Stocks controller.
			StocksController = $controller('StocksController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Stock object fetched from XHR', inject(function(Stocks) {
			// Create sample Stock using the Stocks service
			var sampleStock = new Stocks({
				name: 'New Stock'
			});

			// Create a sample Stocks array that includes the new Stock
			var sampleStocks = [sampleStock];

			// Set GET response
			$httpBackend.expectGET('api/stocks').respond(sampleStocks);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.stocks).toEqualData(sampleStocks);
		}));

		it('$scope.findOne() should create an array with one Stock object fetched from XHR using a stockId URL parameter', inject(function(Stocks) {
			// Define a sample Stock object
			var sampleStock = new Stocks({
				name: 'New Stock'
			});

			// Set the URL parameter
			$stateParams.stockId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/api\/stocks\/([0-9a-fA-F]{24})$/).respond(sampleStock);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.stock).toEqualData(sampleStock);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Stocks) {
			// Create a sample Stock object
			var sampleStockPostData = new Stocks({
				name: 'New Stock'
			});

			// Create a sample Stock response
			var sampleStockResponse = new Stocks({
				_id: '525cf20451979dea2c000001',
				name: 'New Stock'
			});

			// Fixture mock form input values
			scope.name = 'New Stock';

			// Set POST response
			$httpBackend.expectPOST('api/stocks', sampleStockPostData).respond(sampleStockResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Stock was created
			expect($location.path()).toBe('/stocks/' + sampleStockResponse._id);
		}));

		it('$scope.update() should update a valid Stock', inject(function(Stocks) {
			// Define a sample Stock put data
			var sampleStockPutData = new Stocks({
				_id: '525cf20451979dea2c000001',
				name: 'New Stock'
			});

			// Mock Stock in scope
			scope.stock = sampleStockPutData;

			// Set PUT response
			$httpBackend.expectPUT(/api\/stocks\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/stocks/' + sampleStockPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid stockId and remove the Stock from the scope', inject(function(Stocks) {
			// Create new Stock object
			var sampleStock = new Stocks({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Stocks array and include the Stock
			scope.stocks = [sampleStock];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/api\/stocks\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleStock);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.stocks.length).toBe(0);
		}));
	});
}());