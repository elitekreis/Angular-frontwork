'use strict';

// Reportes controller
angular.module('reportes')
    .controller('ReportesVentasController',
        [
            '$scope',
            '$stateParams',
            '$location',
            'Authentication',
            'ReportesVentas',
            'Comprobantes',
            'Products',
            'Enterprises',
            'Condicionventas',
            'Clients',
            '$rootScope',
            '$state',
            '$filter',
            '$mdDialog',
            '$http',
            '$timeout',
            'Subs',
            'Providers',
            'Reportes',
            '$q',
            function ($scope,
                      $stateParams,
                      $location,
                      Authentication,
                      ReportesVentas,
                      Comprobantes,
                      Products,
                      Enterprises,
                      Condicionventas,
                      Clients,
                      $rootScope,
                      $state,
                      $filter,
                      $http,
                      $timeout,
                      Subs,
                      Providers,
                      Reportes,
                      $q) {
                var vm = this;
                $scope.authentication = Authentication;
                console.log('[+] ReportesVentasController::fired!');

                // watch for SEARCH to update value
                $scope.$watchCollection('authentication', function () {
                    vm.SEARCH = {enterprise: $scope.authentication.user.enterprise ? $scope.authentication.user.enterprise.enterprise : null};
                    //vm.find();
                    activate();
                });

                $scope.$watchCollection(angular.bind(this, function () {
                    return this.modelo;
                }), function () {
                    console.log('modelo changed to ' + vm.modelo);
                });

                vm.find = function () {
                    if (vm.SEARCH !== undefined) {
                        vm.reportes = Reportes.query({e: vm.SEARCH.enterprise});
                    }
                };

                // Find existing Venta
                vm.findOne = function () {
                    Reportes.get({}, function (res) {
                            // success
                        },
                        function (err) {
                            //error
                        }
                    );
                };

                vm.performanceChartData = [];
                vm.performancePeriod = 'year';
                vm.changePeriod = changePeriod;
                vm.yearValue = '2016';
                vm.quarterValue = '2016-1Q';
                vm.monthValue = '2016-3';

                vm.chartOptions = {
                    chart: {
                        //type: 'multiBarHorizontalChart',
                        //type: 'lineChart',
                        type: 'lineWithFocusChart',
                        objectequality: true,
                        height: 450,
                        duration: 500,
                        isArea: true,
                        //margin: { left: 50, right: 50 },
                        //x: function (d) { return d[0] },
                        //y: function (d) { return d[1] },
                        x: function (d) {
                            return d.label;
                        },
                        y: function (d) {
                            return d.value;
                        },
                        showLabels: false,
                        showLegend: false,
                        useInteractiveGuideline: true,
                        title: 'Ventas año ' + vm.yearValue,
                        xAxis: {
                            showMaxMin: false,
                            axisLabel: 'Mes',
                            tickFormat: function (d) {
                                //console.log('[+] el valor de d es: ', d);
                                //console.log('[+] fecha para mostrar: ', d3.time.format('%Y/%m/%d')(new Date(d)));
                                //return d3.time.format('%Y-%m')(new Date(d))
                                return d3.time.format('%Y-%m-%d')(new Date(d))
                            }
                        },
                        x2Axis: {
                            tickFormat: function (d) {
                                //return d3.time.format('%Y-%m')(new Date(d));
                                return d3.time.format('%Y-%m-%d')(new Date(d))
                            }
                        },
                        yAxis: {
                            axisLabel: 'Ingresos ($)',
                            tickFormat: function (d) {
                                return d3.format(',.2f')(d);
                            }
                        },
                        y2Axis: {
                            tickFormat: function (d) {
                                return d3.format(',.2f')(d);
                            }
                        },
                        //showYAxis: false,
                        //showXAxis: false,
                        //color: ['rgb(0, 150, 136)', 'rgb(204, 203, 203)', 'rgb(149, 149, 149)', 'rgb(44, 44, 44)'],
                        //tooltip: { contentGenerator: function (d) { return '<div class="custom-tooltip">' + d.point.y + '%</div>' + '<div class="custom-tooltip">' + d.series[0].key + '</div>' } },
                        showControls: false
                    }
                };


                function activate() {
                    //loadData();
                    var queries = [loadData(vm.performancePeriod)];
                    //$q.all(queries);
                    //console.log('$q is: ', queries);
                }


                function loadData(periodo) {
                    //vm.modelo = [];
                    if (vm.SEARCH !== undefined) {
                        switch (periodo) {
                            case 'year':
                                ReportesVentas.getDataYear(vm.yearValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        //vm.performanceChartData = data.data;
                                        console.log('algo', data.data);
                                        vm.performanceChartData = data.data.map(function (item) {
                                            //var p = item.resultado.month.split('-');
                                            // var p = item.resultado.day.split('-');
                                            // var year = parseInt(p[0]);
                                            // var month = parseInt(p[1]);
                                            // var d = new Date(year, month);

                                            var p = item.resultado.day.split('-');
                                            var year = parseInt(p[0]);
                                            var w = parseInt(p[1]);
                                            var d = new Date(year, 0);

                                            d = d.setDate(w);


                                            //console.log('[+] mapeando: ', d);
                                            return {
                                                label: d,
                                                value: item.balance || 0//,
                                                //estado: item.resultado.estado
                                            };
                                        });

                                        vm.performanceChartData2 = data.data.map(function (item) {
                                            var p = item.resultado.day.split('-');
                                            var year = parseInt(p[0]);
                                            var w = parseInt(p[1]);
                                            var d = new Date(year, 0);

                                            d = d.setDate(w);

                                            return {
                                                label: d,
                                                value: item.balance || 0//,
                                                //estado: item.resultado.estado
                                            };
                                        });

                                        if (vm.performanceChartData !== undefined) {
                                            vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, function (item) {
                                                //if(item.estado !== 'Finalizada') { item.value = 0};
                                                return item;
                                            }), 'label');//{ estado: 'Finalizada'}),'label')
                                            vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function (item) {
                                                //if(item.estado === 'Finalizada') {item.value = 0}
                                                return item;
                                            }), 'label');

                                            vm.modelo = [/*{
								key: 'No finalizadas',
								color: '#d62728',
								values: vm.filteredData2
							},*/
                                                {
                                                    key: 'Finalizadas',
                                                    color: '#1f77b4',
                                                    values: vm.filteredData1,
                                                }];
                                            // 		console.log('[+] modelo: ', vm.modelo);
                                            // vm.modelo = [{
                                            // 	key: 'No finalizadas',
                                            // 	color: '#d62728',
                                            // 	values: [
                                            // 		{ value: 15000, label: new Date('2015-01-01')},
                                            // 		{ value: 15800, label: new Date('2015-02-01')},
                                            // 		{ value: 30000, label: new Date('2015-03-01')},
                                            // 		{ value: 28000, label: new Date('2015-04-01')},
                                            // 		{ value: 17000, label: new Date('2015-05-01')},
                                            // 		{ value: 25000, label: new Date('2015-06-01')},
                                            // 		{ value: 42000, label: new Date('2015-07-01')},
                                            // 		{ value: 39000, label: new Date('2015-08-01')},
                                            // 		{ value: 19800, label: new Date('2015-09-01')},
                                            // 		{ value: 23000, label: new Date('2015-10-01')},
                                            // 		{ value: 32000, label: new Date('2015-11-01')},
                                            // 		{ value: 57000, label: new Date('2015-12-01')},
                                            // 	]
                                            // }];
                                        } else {
                                            console.log('[+] la concha de su madre');
                                        }

                                    });
                                break;

                            case 'quarter':
                                vm.modelo = undefined;
                                ReportesVentas.getDataQuarter(vm.quarterValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        console.log('[+] getDataQuarter::data: ', data);
                                        //vm.performanceChartData = data.data;

                                        vm.performanceChartData = data.data.map(function (item) {
                                            return {
                                                label: item.resultado.month,
                                                value: item.balance,
                                                estado: item.resultado.estado
                                            };
                                        });
                                        //console.log('[+] vm.performanceChartData: ', vm.performanceChartData);
                                        vm.performanceChartData2 = data.data.map(function (item) {
                                            return {
                                                label: item.resultado.month,
                                                value: (item.balance) * (-1),
                                                estado: item.resultado.estado
                                            };
                                        });
                                        //console.log('[+] vm.performanceChartData2: ', vm.performanceChartData2);
                                        if (vm.performanceChartData !== undefined) {
                                            vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, {estado: 'Finalizada'}), 'label')
                                            vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function (item) {
                                                if (item.estado === 'Finalizada') {
                                                    item.value = 0
                                                }
                                                return item;
                                            }), 'label');

                                            vm.modelo = [{
                                                key: 'No finalizadas',
                                                color: '#d62728',
                                                values: vm.filteredData2
                                            },
                                                {
                                                    key: 'Finalizadas',
                                                    color: '#1f77b4',
                                                    values: vm.filteredData1,
                                                }];
                                            //console.log('[+] vm.modelo: ', vm.modelo);
                                        } else {
                                            console.log('[+] la concha de su madre');
                                        }


                                    });

                                break;

                            case 'month':
                                ReportesVentas.getDataMonth(vm.monthValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        //vm.performanceChartData = data.data;

                                        vm.performanceChartData = data.data.map(function (item) {
                                            return {
                                                label: item.resultado.month,
                                                value: item.balance,
                                                estado: item.resultado.estado
                                            };
                                        });

                                        vm.performanceChartData2 = data.data.map(function (item) {
                                            return {
                                                label: item.resultado.month,
                                                value: (item.balance) * (-1),
                                                estado: item.resultado.estado
                                            };
                                        });

                                        if (vm.performanceChartData !== undefined) {
                                            vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, {estado: 'Finalizada'}), 'label')
                                            vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function (item) {
                                                if (item.estado === 'Finalizada') {
                                                    item.value = 0
                                                }
                                                return item;
                                            }), 'label');

                                            vm.modelo = [{
                                                key: 'No finalizadas',
                                                color: '#d62728',
                                                values: vm.filteredData2
                                            },
                                                {
                                                    key: 'Finalizadas',
                                                    color: '#1f77b4',
                                                    values: vm.filteredData1,
                                                }];
                                        } else {
                                            console.log('[+] la concha de su madre');
                                        }


                                    });
                                break;
                            default:

                        }


                        //console.log('la posta es: ', vm.performanceChartData);
                        //});
                    }
                    ;
                };

                function changePeriod() {
                    console.log('[+] changePeriod::fired! ', vm.performancePeriod);
                    //loadData(vm.performancePeriod);
                    var queries = [loadData(vm.performancePeriod)];
                }
            }
        ]);
