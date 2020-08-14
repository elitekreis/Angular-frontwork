'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('reportes').factory('ReportesCompras', ['$http',
	function($http) {
		return {
			getDataYear: function(year, enterprise) {
				console.log('[+] reportes::ReportesCompras::getDataYear:fired!');
				return $http({
                        method: "get",
                        url: "/api/reportes/compras/byYear/" + year,
                        params: {
                            e: enterprise
                        }/*,
                        data: {
                            name: name
                        }*/
                    });
			},
			getDataQuarter: function(quarter, enterprise) {
				return $http({
                        method: "get",
                        url: "/api/reportes/compras/byQ/" + quarter,
                        params: {
                            e: enterprise
                        }/*,
                        data: {
                            name: name
                        }*/
                    });
			},
			getDataMonth: function(month, enterprise) {
				return $http({
                        method: "get",
                        url: "/api/reportes/compras/byMonth/" + month,
                        params: {
                            e: enterprise
                        }/*,
                        data: {
                            name: name
                        }*/
                    });
			},
			getDataDetailedMonth: function (month, enterprise, category, products) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/byMonthDetailed/" + month,
					params: {
						e: enterprise,
						category: category,
                        products: products
					}
				})
			},
			getDataWeek: function(week, enterprise, category, products) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/byWeek/" + week,
					params: {
						e: enterprise,
						category: category,
                        products: products
					}
				})
			},
			getDataDay: function(day, enterprise, category, products) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/byDay/" + day,
					params: {
						e: enterprise,
						category: category,
                        products: products
					}
				})
			},
			getDataRange: function (start, end, enterprise, category, products) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/byRange",
					params: {
						e: enterprise,
						start: start,
						end: end,
						category: category,
                        products: products
					}
				})
			},
			getDataCategoriasDay: function(day, enterprise) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/categorias/byDay/" + day,
					params: {
						e: enterprise
					}
				})
			},
			getDataCategoriasMonth: function(month, enterprise) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/categorias/byMonth/" + month,
					params: {
						e: enterprise
					}
				})
			},getDataCategoriasWeek: function(week, enterprise) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/categorias/byWeek/" + week,
					params: {
						e: enterprise
					}
				})
			},getDataCategoriasRange: function(start, end ,enterprise) {
				return $http({
					method: "get",
					url: "/api/reportes/compras/categorias/byRange/",
					params: {
						e: enterprise,
						Start: start,
						End: end
					}
				})
			},

		}
	}
]);
