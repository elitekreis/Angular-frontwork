'use strict';

//Reportes service used to communicate Reportes REST endpoints
angular.module('reportes').factory('ReportesVentas', ['$http',
    function($http) {
        return {
            getDataYear: function(year, enterprise) {
                console.log('[+] reportes::ReportesVentas::getDataYear:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/byYear/" + year,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataQuarter: function(quarter, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/byQ/" + quarter,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataMonth: function(month, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/byMonth/" + month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataProductYear: function(year, enterprise) {
                console.log('[+] reportes::ReportesVentas::getDataYear:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/productos/byYear/" + year,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataProductQuarter: function(quarter, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/productos/byQ/" + quarter,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataProductMonth: function(month, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/productos/byMonth/" + month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataDetailedMonth: function(month, enterprise, category, products) {
                console.log("Category: " + category);
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/byMonthDetailed/" + month,
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
                    url: "/api/reportes/ventas/byWeek/" + week,
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
                    url: "/api/reportes/ventas/byDay/" + day,
                    params: {
                        e: enterprise,
                        category: category,
                        products: products
                    }
                })
            },
            getDataRange: function(start, end, enterprise, category, products) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end,
                        category: category,
                        products: products
                    }
                })
            },
            getDataCategoriasDay: function(Day, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasDay:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/categorias/byDay/" + Day,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },

            getDataCondiVentaDay: function(Day, enterprise) {
                console.log('[+] reportes::ReportesVentasCondiVenta::getDataCondiVentaDay:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/condiventa/byDay/" + Day,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataComprobanteDay: function(Day, enterprise) {
                console.log('[+] reportes::ReportesVentasCondiVenta::getDataCondiVentaDay:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/comprobante/byDay/" + Day,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataComprobanteDayPuesto: function(Day, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasDay:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/comprobante/byDay/" + Day,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCondiVentaDayPuesto: function(Day, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasDay:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/condiVenta/byDay/" + Day,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCategoriasDayPuesto: function(Day, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasDay:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/byDay/" + Day,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCategoriasWeek: function(Week, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasWeek:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/categorias/byWeek/" + Week,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCategoriasWeekPuesto: function(Week, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasWeek:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/byWeek/" + Week,
                    params: {
                        e: enterprise
                    }

                });
            },


            getDataCondiVentaWeek: function(Week, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasWeek:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/condiVenta/byWeek/" + Week,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCondiVentaWeekPuesto: function(Week, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasWeek:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/condiVenta/byWeek/" + Week,
                    params: {
                        e: enterprise
                    }

                });
            },

            getDataComprobanteWeek: function(Week, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasWeek:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/comprobante/byWeek/" + Week,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataComprobanteWeekPuesto: function(Week, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasWeek:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/comprobante/byWeek/" + Week,
                    params: {
                        e: enterprise
                    }

                });
            },



            getDataCategoriasMonth: function(Month, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasMonth:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/categorias/byMonth/" + Month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCategoriasMonthPuesto: function(Month, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasMonth:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/byMonth/" + Month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },

            getDataCondiVentaMonth: function(Month, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasMonth:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/condiVenta/byMonth/" + Month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCondiVentaMonthPuesto: function(Month, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasMonth:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/condiVenta/byMonth/" + Month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataComprobanteMonth: function(Month, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasMonth:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/comprobante/byMonth/" + Month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataComprobanteMonthPuesto: function(Month, enterprise) {
                console.log('[+] reportes::ReportesVentasCategorias::getDataCategoriasMonth:fired!');
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/comprobante/byMonth/" + Month,
                    params: {
                        e: enterprise
                    }
                    /*,
                                            data: {
                                                name: name
                                            }*/
                });
            },
            getDataCategoriasRange: function(start, end, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/categorias/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end
                    }
                })
            },
            getDataCategoriasRangePuesto: function(start, end, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end
                    }
                })
            },

            getDataCondiVentaRange: function(start, end, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/condiVenta/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end
                    }
                })
            },
            getDataCondiVentaRangePuesto: function(start, end, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/condiVenta/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end
                    }
                })
            },

            getDataComprobanteRange: function(start, end, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/comprobante/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end
                    }
                })
            },
            getDataComprobanteRangePuesto: function(start, end, enterprise) {
                return $http({
                    method: "get",
                    url: "/api/reportes/ventas/puestos/comprobante/byRange",
                    params: {
                        e: enterprise,
                        start: start,
                        end: end
                    }
                })
            }
        }
    }
]);