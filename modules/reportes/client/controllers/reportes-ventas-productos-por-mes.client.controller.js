'use strict';

// Reportes controller
angular.module('reportes')
    .controller('ReportesVentasProductosPorMesController',
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
                vm.performancePeriod = 'month';
                vm.changePeriod = changePeriod();
                vm.chartOptions = {
                    chart: {
                        //type: 'multiBarHorizontalChart',
                        type: 'lineWithFocusChart',
                        objectequality: true,
                        height: 450,
                        duration: 500,
                        isArea: false,
                        //margin: { left: 50, right: 50 },
                        //x: function (d) { return d[0] },
                        //y: function (d) { return d[1] },
                        x: function (d) {
                            return d.day;
                        },
                        y: function (d) {
                            return d.cantidad;
                        },
                        showLabels: true,
                        showLegend: true,
                        useInteractiveGuideline: true,
                        title: 'Ventas año ' + vm.yearValue,
                        xAxis: {
                            showMaxMin: false,
                            axisLabel: 'Día',
                            tickFormat: function (d) {
                                //console.log('[+] el valor de d es: ', d);
                                //console.log('[+] fecha para mostrar: ', d3.time.format('%Y/%m/%d')(new Date(d)));
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
                            axisLabel: 'Cantidad',
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
                        showControls: true
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
                                ReportesVentas.getDataProductYear(vm.yearValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        //vm.performanceChartData = data.data;

                                        vm.performanceChartData = data.data.map(function (item) {
                                            var p = item.resultado.month.split('-');
                                            var year = parseInt(p[0]);
                                            var month = parseInt(p[1]);
                                            var d = new Date(year, month);

                                            //console.log('[+] mapeando: ', d);
                                            return {
                                                label: d,
                                                value: item.balance || 0//,
                                                //estado: item.resultado.estado
                                            };
                                        });

                                        vm.performanceChartData2 = data.data.map(function (item) {
                                            var p = item.resultado.month.split('-');
                                            var year = parseInt(p[0]);
                                            var month = parseInt(p[1]);
                                            var d = new Date(year, month);

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

                                            vm.modelo = [
                                                {
                                                    key: 'Finalizadas',
                                                    color: '#1f77b4',
                                                    values: vm.filteredData1,
                                                }];
                                        } else {
                                            console.log('[+] la concha de su madre');
                                        }

                                    });
                                console.log("xvcc");
                                console.log(vm);
                                if (!vm.yearValue) {
                                    vm.yearValue = 2016;
                                }
                                ReportesVentas.getDataCategoriasYear(vm.yearValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        console.log("=======categoriesd==========");
                                        console.log(data);
                                        vm.modelcatyear = data.data;
                                    });
                                break;

                            case 'quarter':
                                vm.modelo = undefined;
                                ReportesVentas.getDataProductQuarter(vm.quarterValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        console.log('[+] getDataProductQuarter::data: ', data);
                                        //vm.performanceChartData = data.data;

                                        vm.performanceChartData = data.data.map(function (item) {
                                            var p = item.resultado.week.split('-');
                                            var year = parseInt(p[0]);
                                            var w = parseInt(p[1]);
                                            var d = new Date(year, 0, (1 + (w) * 7));

                                            //console.log('[+] mapeando: ', d);
                                            return {
                                                label: d,
                                                value: item.balance || 0//,
                                                //estado: item.resultado.estado
                                            };
                                        });
                                        //console.log('[+] vm.performanceChartData: ', vm.performanceChartData);
                                        vm.performanceChartData2 = data.data.map(function (item) {

                                            var p = item.resultado.week.split('-');
                                            var year = parseInt(p[0]);
                                            var w = parseInt(p[1]);
                                            var d = new Date(year, 0, (1 + (w) * 7));

                                            //console.log('[+] mapeando: ', d);
                                            return {
                                                label: d,
                                                value: item.balance || 0//,
                                                //estado: item.resultado.estado
                                            };
                                        });
                                        //console.log('[+] vm.performanceChartData2: ', vm.performanceChartData2);
                                        if (vm.performanceChartData !== undefined) {
                                            vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, function (item) {
                                                //if(item.estado !== 'Finalizada') { item.value = 0};
                                                return item;
                                            }), 'label');//{ estado: 'Finalizada'}),'label')
                                            vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function (item) {
                                                //if(item.estado === 'Finalizada') {item.value = 0}
                                                return item;
                                            }), 'label');

                                            vm.modelo1 = [
                                                {
                                                    key: 'Finalizadas',
                                                    color: '#1f77b4',
                                                    values: vm.filteredData1,
                                                }];
                                        } else {
                                            console.log('[+] la concha de su madre');
                                        }


                                    });
                                if (!vm.yearValue) {
                                    vm.yearValue = 2016;
                                }
                                ReportesVentas.getDataCategoriasYear(vm.yearValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        console.log("=======categoriesd==========");
                                        console.log(data);
                                        vm.modelcatyear = data.data;
                                    });

                                break;

                            case 'month':
                                ReportesVentas.getDataProductYear(vm.yearValue, vm.SEARCH.enterprise)
                                    .then(function (data) {
                                        //vm.performanceChartData = data.data;
                                        console.log('data in month is: ', data);
                                        vm.performanceChartData = data.data.map(function (item) {
                                            var dvalues = item.values.map(function (dvalue) {
                                                var p = dvalue.day.split('-');
                                                var year = parseInt(p[0]);
                                                var w = parseInt(p[1]);
                                                var d = new Date(year, 0);
                                                d = d.setDate(w);

                                                return {
                                                    cantidad: dvalue.cantidad,
                                                    day: d
                                                }
                                            });


                                            //console.log('[+] mapeando: ', d);
                                            return {
                                                key: item.key,
                                                values: dvalues || []//,
                                                //estado: item.resultado.estado
                                            };
                                        });

                                        // vm.performanceChartData2 = data.data.resultado.balanceDia.map(function(item){
                                        // 	var p = item.resultado.day.split('-');
                                        // 	var year = parseInt(p[0]);
                                        // 	var w = parseInt(p[1]);
                                        // 	var d = new Date(year, 0);
                                        //
                                        // 	d = d.setDate(w);
                                        //
                                        // 	//console.log('[+] mapeando: ', d);
                                        // 	return {
                                        // 		label: d,
                                        // 		value: item.cantidad || 0//,
                                        // 		//estado: item.resultado.estado
                                        // 	};
                                        // });

                                        if (vm.performanceChartData !== undefined) {
                                            vm.filteredData1 = $filter('orderBy')($filter('filter')(vm.performanceChartData, function (item) {
                                                //if(item.estado !== 'Finalizada') { item.value = 0};
                                                return item;
                                            }), 'key');//{ estado: 'Finalizada'}),'label')
                                            // vm.filteredData2 = $filter('orderBy')($filter('filter')(vm.performanceChartData2, function(item){
                                            // 	//if(item.estado === 'Finalizada') {item.value = 0}
                                            // 	return item;
                                            // }), 'label');

                                            // vm.modelo2 = [
                                            // 	{
                                            // 		key: 'Finalizadas',
                                            // 		color: '#1f77b4',
                                            // 		values: vm.filteredData1,
                                            // 	}];

                                            vm.modelo2 = vm.filteredData1;
                                            console.log('esta es la posta: ', vm.modelo2);
                                        } else {
                                            console.log('[+] la concha de su madre');
                                        }

                                    });
                                // if(!vm.yearValue){
                                // 	vm.yearValue=2016;
                                // }
                                // ReportesVentas.getDataCategoriasYear(vm.yearValue, vm.SEARCH.enterprise)
                                // .then(function(data){
                                // console.log("=======categoriesd==========");
                                // console.log(data);
                                // 	vm.modelcatyear=data.data;
                                // });
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
