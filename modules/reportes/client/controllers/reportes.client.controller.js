'use strict';

// Reportes controller
angular.module('reportes').controller('ReportesController', [
    '$scope',
    '$stateParams',
    '$location',
    '$filter',
    'user',
    'tipoReporte',
    'reportesVentas',
    'ReportesCompras',
    'Puestos',
    'Costcenters',
    '$q',
    'lodash',
    function($scope, $stateParams, $location, $filter, user, tipoReporte, reportesVentas, ReportesCompras, Puestos, Costcenters, $q, lodash) {

        //var vm = this;
        this.user = user;

        this.isDayLoading = true;
        this.isWeekLoading = true;
        this.isMonthLoading = true;
        this.isRangeLoading = false;

        var now = new Date();
        var day = getDay(now);
        var month = getMonth(now);
        var week = getWeek(now);

        this.date = now;
        this.weekInput = now;
        this.monthInput = now;

        this.category = null;
        this.products = null;

        this.showByCategory = function(tab) {
            this.category = "category";

            if (tab == 'rangepickerSelected') {
                this.rangepickerSelected();
            } else {
                this.loadReportes(tab);
            }
        };

        this.showByProducts = function(tab) {
            this.products = "product";

            if (tab == 'rangepickerSelected') {
                this.rangepickerSelected();
            } else {
                this.loadReportes(tab);
            }
        };

        this.rangepickerSelected = function() {
            if (this.dateStart && this.dateEnd) {
                this.isRangeLoading = true;
                if ($stateParams.tipo === 'venta') {
                    reportesVentas.getDataRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id, this.category, this.products)
                        .then(angular.bind(this, function(data) {
                            this.isRangeLoading = false;
                            this.range.balance = data.data.balance;
                            this.range.byCategory = data.data.byCategory;
                            this.range.byProduct = data.data.byProduct;
                            this.range.byPuesto = data.data.byPuesto;
                            this.selectedIndex = 0;
                        }))

                    reportesVentas.getDataCategoriasRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            console.log("=======categoriesd==========");
                            console.log(data);
                            this.range.modelcat = data.data;
                        }))
                    reportesVentas.getDataCategoriasRangePuesto(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            console.log("=======categoriesdFilter==========");
                            console.log(data);
                            this.range.modelcatPuesto = data.data;
                        }))


                    reportesVentas.getDataCondiVentaRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            console.log("=======categoriesd==========");
                            console.log(data);
                            this.range.modelCondiVenta = data.data;
                        }))
                    reportesVentas.getDataCondiVentaRangePuesto(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            console.log("=======categoriesdFilter==========");
                            console.log(data);
                            this.range.modelCondiVentaPuesto = data.data;
                        }))

                    reportesVentas.getDataComprobanteRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            console.log("=======categoriesd==========");
                            console.log(data);
                            this.range.modelComprobante = data.data;
                        }))
                    reportesVentas.getDataComprobanteRangePuesto(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id)
                        .then(angular.bind(this, function(data) {
                            console.log("=======categoriesdFilter==========");
                            console.log(data);
                            this.range.modelComprobantePuesto = data.data;
                        }))

                    this.category = null;
                    this.products = null;
                } else {
                    ReportesCompras.getDataRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id, this.category, this.products)
                        .then(angular.bind(this, function(data) {
                            this.isRangeLoading = false;
                            this.range.balance = data.data.balance;
                            this.range.byCategory = data.data.byCategory;
                            this.range.byProduct = data.data.byProduct;
                            this.range.byPuesto = data.data.byPuesto;
                        }))

                    ReportesCompras.getDataCategoriasRange(getDay(this.dateStart), getDay(this.dateEnd), this.user.enterprise._id).then(angular.bind(this, function(data) {
                        this.range.modelcat = data.data;
                    }));

                    this.category = null;
                    this.products = null;
                }
            }
        };

        this.monthSelected = function() {
            if (this.monthInput) {
                this.isMonthLoading = true;
                this.monthValue = getMonth(this.monthInput);
                this.loadReportes('mes');
            }
        };

        this.weekSelected = function() {
            if (this.weekInput) {
                this.isWeekLoading = true;
                this.weekValue = getWeek(this.weekInput);
                this.loadReportes('semana');
            }
        };

        this.datepickerSelected = function() {
            if (this.date) {
                this.isDayLoading = true;
                this.dayValue = getDay(this.date);
                this.loadReportes('dia');
            }
        }

        this.findPuestoById = function(puestoId) {
            return lodash.find($scope.puestos, function(puesto) {
                return puesto._id === puestoId;
            });
        };
        this.findCostcenterByPuesto = function(puesto) {
            return lodash.find($scope.costcenters, function(costcenter) {
                return costcenter._id === puesto.centroDeCosto;
            });
        };
        this.findTabName = function(puestoVetas) {
            if (puestoVetas.from === "others") {
                return puestoVetas.from;
            } else {
                return this.findCostcenterByPuesto(this.findPuestoById(puestoVetas.from)).name;
            }
        };


        this.dayValue = day;
        this.monthValue = month;
        this.weekValue = week;

        this.day = {};
        this.week = {};
        this.month = {};
        this.range = {};

        this.tipoReporte = tipoReporte;
        this.getPuestos = function() {
            var deferred = $q.defer();
            Puestos.query({}, function(res) {
                $scope.puestos = res;
                Costcenters.query({}, function(data) {
                    $scope.costcenters = data;
                    deferred.resolve(true);
                    // var relatedCostCenter = $filter('filter')(data, function(item) {
                    //     return item.id === puesto.centroDeCosto;
                    // })[0];


                });
            });
            return deferred.promise;

        };
        var ctrl = this;

        this.loadReportes = function(tab) {

            this.getPuestos().then(angular.bind(this, function() {

                if ($stateParams.tipo === 'venta') {
                    if (tab == 'dia') {
                        reportesVentas.getDataDay(this.dayValue, this.user.enterprise._id, this.category, this.products)
                            .then(angular.bind(this, function(data) {
                                this.day.balance = data.data.balance;
                                this.day.byCategory = data.data.byCategory;
                                this.day.byProduct = data.data.byProduct;
                                this.day.byPuesto = data.data.byPuesto;
                                this.isDayLoading = false;
                            }));

                        reportesVentas.getDataCategoriasDay(this.dayValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesday!aa==========");
                                console.log(data);
                                this.day.modelcat = data.data;
                            }));
                        reportesVentas.getDataCondiVentaDay(this.dayValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======CondiVentaday!aa==========");
                                console.log(data);
                                this.day.modelCondiVenta = data.data;
                            }));
                        reportesVentas.getDataComprobanteDay(this.dayValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======Comprobanteday!aa==========");
                                console.log(data);
                                this.day.modelComprobante = data.data;
                            }));
                        reportesVentas.getDataCondiVentaDayPuesto(this.dayValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======CondiVentadayPusto!aa==========");
                                console.log(data);
                                this.day.modelCondiVentaPuesto = data.data;
                            }));
                        reportesVentas.getDataComprobanteDayPuesto(this.dayValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======ComprobantedayPuesto!aa==========");
                                console.log(data);
                                this.day.modelComprobantePuesto = data.data;
                            }));

                        reportesVentas.getDataCategoriasDayPuesto(this.dayValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesdayFilter==========");
                                console.log(data);
                                this.day.modelcatPuesto = data.data;
                            }));

                        this.category = null;
                        this.products = null;
                    } else if (tab == 'semana') {
                        reportesVentas.getDataWeek(this.weekValue, this.user.enterprise._id, this.category, this.products)
                            .then(angular.bind(this, function(data) {
                                this.week.balance = data.data.balance;
                                this.week.byCategory = data.data.byCategory;
                                this.week.byProduct = data.data.byProduct;
                                this.week.byPuesto = data.data.byPuesto;
                                this.isWeekLoading = false;
                            }));

                        reportesVentas.getDataCategoriasWeek(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweek==========");
                                console.log(data);
                                this.week.modelcat = data.data;
                            }));

                        reportesVentas.getDataCategoriasWeekPuesto(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweekFilter==========");
                                console.log(data);
                                this.week.modelcatPuesto = data.data;
                            }))
                        reportesVentas.getDataCondiVentaWeek(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweek==========");
                                console.log(data);
                                this.week.modelCondiVenta = data.data;
                            }));

                        reportesVentas.getDataCondiVentaWeekPuesto(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweekFilter==========");
                                console.log(data);
                                this.week.modelCondiVentaPuesto = data.data;
                            }))
                        reportesVentas.getDataComprobanteWeek(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweek==========");
                                console.log(data);
                                this.week.modelComprobante = data.data;
                            }));

                        reportesVentas.getDataComprobanteWeekPuesto(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweekFilter==========");
                                console.log(data);
                                this.week.modelComprobantePuesto = data.data;
                            }))

                        this.category = null;
                        this.products = null;
                    } else {
                        reportesVentas.getDataDetailedMonth(this.monthValue, this.user.enterprise._id, this.category, this.products)
                            .then(angular.bind(this, function(data) {
                                console.log("_______month DATA______");
                                console.log(data);
                                this.month.balance = data.data.balance;
                                this.month.byCategory = data.data.byCategory;
                                this.month.byProduct = data.data.byProduct;
                                this.month.byPuesto = data.data.byPuesto;

                                this.isMonthLoading = false;
                            }));

                        reportesVentas.getDataCategoriasMonth(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonth==========");
                                console.log(data);
                                this.month.modelcat = data.data;
                            }))

                        reportesVentas.getDataCategoriasMonthPuesto(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonthFilter==========");
                                console.log(data);
                                this.month.modelcatPuesto = data.data;
                            }));


                        reportesVentas.getDataCondiVentaMonth(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonth==========");
                                console.log(data);
                                this.month.modelCondiVenta = data.data;
                            }))

                        reportesVentas.getDataCondiVentaMonthPuesto(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonthFilter==========");
                                console.log(data);
                                this.month.modelCondiVentaPuesto = data.data;
                            }));


                        reportesVentas.getDataComprobanteMonth(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonth==========");
                                console.log(data);
                                this.month.modelComprobante = data.data;
                            }))

                        reportesVentas.getDataComprobanteMonthPuesto(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonthFilter==========");
                                console.log(data);
                                this.month.modelComprobantePuesto = data.data;
                            }));



                        this.category = null;
                        this.products = null;
                    }
                } else {
                    if (tab == 'dia') {
                        ReportesCompras.getDataDay(this.dayValue, this.user.enterprise._id, this.category, this.products)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesday!faaaa==========");
                                console.log("===============Compras Da============")
                                this.day.balance = data.data.balance;
                                this.day.byCategory = data.data.byCategory;
                                this.day.byProduct = data.data.byProduct;
                                this.day.byPuesto = data.data.byPuesto;
                                this.isDayLoading = false;
                            }));


                        ReportesCompras.getDataCategoriasDay(this.dayValue, this.user.enterprise._id).then(angular.bind(this, function(data) {
                            console.log("=======categoriesday!aa==========");
                            console.log(data);
                            this.day.modelcat = data.data;
                        }));

                        this.category = null;
                        this.products = null;
                    } else if (tab == 'semana') {
                        ReportesCompras.getDataWeek(this.weekValue, this.user.enterprise._id, this.category, this.products)
                            .then(angular.bind(this, function(data) {
                                this.week.balance = data.data.balance;
                                this.week.byCategory = data.data.byCategory;
                                this.week.byProduct = data.data.byProduct;
                                this.week.byPuesto = data.data.byPuesto;
                                this.isWeekLoading = false;
                            }));

                        ReportesCompras.getDataCategoriasWeek(this.weekValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesweek==========");
                                console.log(data);
                                this.week.modelcat = data.data;
                            }));

                        this.category = null;
                        this.products = null;
                    } else {
                        ReportesCompras.getDataDetailedMonth(this.monthValue, this.user.enterprise._id, this.category, this.products)
                            .then(angular.bind(this, function(data) {
                                this.month.balance = data.data.balance;
                                this.month.byCategory = data.data.byCategory;
                                this.month.byProduct = data.data.byProduct;
                                this.month.byPuesto = data.data.byPuesto;
                                this.isMonthLoading = false;
                            }));

                        ReportesCompras.getDataCategoriasMonth(this.monthValue, this.user.enterprise._id)
                            .then(angular.bind(this, function(data) {
                                console.log("=======categoriesmonth==========");
                                console.log(data);
                                this.month.modelcat = data.data;
                            }))

                        this.category = null;
                        this.products = null;
                    }
                }
            }));
        };


        function getDay(date) {
            var start = new Date(date.getFullYear(), 0, 0);
            var diff = date - start;
            var oneDay = 1000 * 60 * 60 * 24;
            var day = Math.floor(diff / oneDay);
            var year = date.getFullYear();
            return (year + '-' + day)
        }

        function getWeek(date) {
            var temp = new Date(date);
            temp.setHours(0, 0, 0);
            temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
            var year = date.getFullYear();
            var week = Math.ceil((((temp - new Date(temp.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
            return (year + '-' + week)
        }

        function getMonth(date) {
            var month = date.getMonth();
            var year = date.getFullYear();
            return (year + '-' + month)
        }
    }
]);