'use strict';

angular.module('core').factory('Menu', ['$location', '$rootScope', 'Authentication', '$timeout',
    function ($location, $rootScope, Authentication, $timeout) {
        var authentication = Authentication.user;
        var sections = [];

        // var session_menu = {
        //       name: 'Sesión',
        //       type: 'toggle',
        //       pages: [{
        //         name: 'Cerrar Sesión',
        //         type: 'link',
        //         state: 'home.logout',
        //         icon: 'logout'
        //       }]
        // };

        // var config_menu = {
        //       name: 'Mi Perfil',
        //       type: 'toggle',
        //       pages: [{
        //         name: 'Editar Perfil',
        //         type: 'link',
        //         state: 'home.editProfile',
        //         icon: 'person'
        //       }, {
        //         name: 'Cambiar Imagen de Perfil',
        //         state: 'home.changeProfilePicture',
        //         type: 'link',
        //         icon: 'insert_photo'
        //       },
        //       {
        //         name: 'Cambiar Contraseña',
        //         state: 'home.changePassword',
        //         type: 'link',
        //         icon: 'lock'
        //       }, {
        //           name: 'Cuentas Sociales',
        //           state: 'home.manageSocialAccounts',
        //           type: 'link',
        //           icon: 'people'
        //         }]
        //     };

        var ventas_staff_menu = {
            name: 'Ventas',
            type: 'toggle',
            state: 'home.ventas',
            pages: [{
                name: 'Venta por mostrador',
                state: 'home.ventasMostrador',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Nueva Venta',
                state: 'home.createVenta',
                type: 'link',
                icon: 'add_circle_outline',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Ventas',
                state: 'home.ventas',
                type: 'link',
                icon: 'remove_red_eye',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Nuevo Presupuesto',
                type: 'link',
                state: 'home.createPedido({ tipo: "venta" })',
                icon: 'add'
            }, {
                name: 'Presupuestos',
                state: 'home.pedidos({ tipo: "venta" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Productos',
                state: 'home.products({tipo: "p"})',
                type: 'link',
                icon: 'store',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Stock de Productos',
                state: 'home.stock({tipo: "p"})',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false                
            }, {
                name: 'Clientes',
                state: 'home.clients',
                type: 'link',
                icon: 'perm_contact_cal',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Reportes',
                state: 'home.reportes({ tipo: "venta"})',
                type: 'link',
                icon: 'insert_chart',
                adminOnly: true,
                staffOnly: false
            }, ]
        };

        var ventas_user_menu = {
            name: 'Ventas',
            type: 'toggle',
            state: 'home.ventas',
            pages: [{
                name: 'Nueva Orden',
                type: 'link',
                state: 'home.createPedido({ tipo: "venta" })',
                icon: 'add'
            }, {
                name: 'Nuevo Presupuesto',
                state: 'home.pedidos({ tipo: "venta" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Consultar Stock',
                state: 'home.stock({tipo: "p"})',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var compras_staff_menu = {
            name: 'Compras',
            type: 'toggle',
            state: 'home.compras',
            pages: [{
                name: 'Nuevo Pedido',
                state: 'home.createPedido({ tipo: "compra" })',
                type: 'link',
                icon: 'add',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Nueva Compra',
                state: 'home.createCompra({ tipo: "compra" })',
                type: 'link',
                icon: 'add_circle_outline',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Solicitudes',
                state: 'home.pedidos({ tipo: "compra" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Compras',
                state: 'home.compras',
                type: 'link',
                icon: 'remove_red_eye',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Proveedores',
                state: 'home.providers',
                type: 'link',
                icon: 'local_shipping',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Materia Prima',
                state: 'home.products({tipo: "m"})',
                type: 'link',
                icon: 'grain',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Insumos',
                state: 'home.products({tipo: "i"})',
                type: 'link',
                icon: 'gesture',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Reportes',
                state: 'home.reportes({ tipo: "compra"})',
                type: 'link',
                icon: 'insert_chart',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var compras_user_menu = {
            name: 'Compras',
            type: 'toggle',
            state: 'home.compras',
            pages: [{
                name: 'Nuevo Pedido',
                state: 'home.createPedido({ tipo: "compra" })',
                type: 'link',
                icon: 'add',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Nueva Compra',
                state: 'home.createCompra({ tipo: "compra" })',
                type: 'link',
                icon: 'add_circle_outline',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Solicitudes',
                state: 'home.pedidos({ tipo: "compra" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Compras',
                state: 'home.compras',
                type: 'link',
                icon: 'remove_red_eye',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Proveedores',
                state: 'home.providers',
                type: 'link',
                icon: 'local_shipping',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Materia Prima',
                state: 'home.products({tipo: "m"})',
                type: 'link',
                icon: 'grain',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Insumos',
                state: 'home.products({tipo: "i"})',
                type: 'link',
                icon: 'gesture',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Stock de Materias Primas',
                state: 'home.stock({tipo: "m"})',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var ventas_user_menu = {
            name: 'Ventas',
            type: 'toggle',
            state: 'home.ventas',
            pages: [{
                name: 'Venta por mostrador',
                state: 'home.ventasMostrador',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Nueva Venta',
                state: 'home.createVenta',
                type: 'link',
                icon: 'add_circle_outline',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Nuevo Presupuesto',
                type: 'link',
                state: 'home.createPedido({ tipo: "venta" })',
                icon: 'add'
            }, {
                name: 'Presupuestos',
                state: 'home.pedidos({ tipo: "venta" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Consultar Stock',
                state: 'home.stock({tipo: "p"})',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var produccion_menu = {
            name: 'Produccion',
            type: 'toggle',
            state: 'home.produccion',
            pages: [{
                name: 'Nueva Solicitud',
                type: 'link',
                state: 'home.createPedido({ tipo: "compra" })',
                icon: 'add'
            }, {
                name: 'Solicitudes',
                state: 'home.pedidos({ tipo: "compra" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Stock de Materias Primas',
                state: 'home.stock({tipo: "m"})',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Productos y Fórmulas',
                state: 'home.products({tipo: "p"})',
                type: 'link',
                icon: 'store',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Costos Indirectos',
                state: 'home.listcentroDeCosto',
                type: 'link',
                icon: 'select_all',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var produccion_user_menu = {
            name: 'Produccion',
            type: 'toggle',
            state: 'home.produccion',
            pages: [{
                name: 'Nueva Solicitud',
                type: 'link',
                state: 'home.createPedido({ tipo: "compra" })',
                icon: 'add'
            }, {
                name: 'Solicitudes',
                state: 'home.pedidos({ tipo: "compra" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Stock de Materias Primas',
                state: 'home.stock({tipo: "m"})',
                type: 'link',
                icon: 'dashboard',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var finanzas_menu = {
            name: 'Finanzas',
            state: 'home.finanzas',
            type: 'toggle',
            icon: 'account_circle',
            adminOnly: true,
            staffOnly: false,
            pages: [
                {
                    name: 'Tesoreria',
                    state: 'home.sucursales',
                    type: 'link',
                    icon: 'account_balance',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Cuentas a pagar',
                    state: 'home.finanzas({ tipo: "debe" })',
                    type: 'link',
                    icon: 'trending_down',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Cuentas a cobrar',
                    state: 'home.finanzas({ tipo: "haber" })',
                    type: 'link',
                    icon: 'trending_up',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Resumen económico',
                    state: 'home.resumenList',
                    type: 'link',
                    icon: 'dashboard'
                }]
        };

        var finanzas_user_menu = {
            name: 'Finanzas',
            state: 'home.finanzas',
            type: 'toggle',
            icon: 'account_circle',
            adminOnly: true,
            staffOnly: false,
            pages: [
                {
                    name: 'Tesoreria',
                    state: 'home.sucursales',
                    type: 'link',
                    icon: 'store',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Cuentas a pagar',
                    state: 'home.finanzas({ tipo: "debe" })',
                    type: 'link',
                    icon: 'trending_down',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Cuentas a cobrar',
                    state: 'home.finanzas({ tipo: "haber" })',
                    type: 'link',
                    icon: 'trending_up',
                    adminOnly: true,
                    staffOnly: false
                }]
        };

        var rrhh_menu = {
            name: 'RRHH',
            state: 'home.rrhh',
            type: 'toggle',
            icon: 'account_circle',
            adminOnly: true,
            staffOnly: false,
            pages: [
                {
                    name: 'Organigrama',
                    type: 'link',
                    state: 'home.rrhh',
                    icon: 'location_city',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Areas',
                    type: 'link',
                    state: 'home.area',
                    icon: 'view_agenda',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Puestos',
                    type: 'link',
                    state: 'home.puesto',
                    icon: 'recent_actors',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Procesos y Manuales',
                    state: 'home.procesos',
                    type: 'link',
                    icon: 'settings'
                }, {
                    name: 'Personal',
                    type: 'link',
                    state: 'home.empleados',
                    icon: 'people'
                }, {
                    name: 'Remuneraciones',
                    type: 'link',
                    state: 'home.remuneraciones',
                    icon: 'folder_shared'
                }, 
                // {
                //     name: 'Nueva Liquidacion',
                //     type: 'link',
                //     state: 'home.createLiquidacion',
                //     icon: 'note_add'
                // }
            ]
        };

        var rrhh_user_menu = {
            name: 'RRHH',
            state: 'home.rrhh',
            type: 'toggle',
            icon: 'account_circle',
            adminOnly: true,
            staffOnly: false,
            pages: [
                {
                    name: 'Organigrama',
                    type: 'link',
                    state: 'home.rrhh',
                    icon: 'location_city',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Areas',
                    type: 'link',
                    state: 'home.area',
                    icon: 'view_agenda',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Puestos',
                    type: 'link',
                    state: 'home.puesto',
                    icon: 'recent_actors',
                    adminOnly: true,
                    staffOnly: false
                }, {
                    name: 'Procesos y Manuales',
                    state: 'home.procesos',
                    type: 'link',
                    icon: 'settings'
                }
            ]
        };

        var impuestos_menu = {
            name: 'Impuestos',
            state: 'home.impuestos',
            type: 'toggle',
            icon: 'gavel',
            pages: [
                {
                    name: 'Impuestos',
                    type: 'link',
                    state: 'home.impuestos',
                    icon: 'local_atm',
                    adminOnly: false,
                    staffOnly: false
                }]
        };

        var config_groso_staff_menu = {
            name: 'Torre de Control',
            type: 'toggle',
            pages: [{
                name: 'Mi Empresa',
                type: 'link',
                state: 'home.enterprises',
                icon: 'business'
            }, {
                name: 'Usuarios',
                state: 'home.personal',
                type: 'link',
                icon: 'group_add',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Comprobantes',
                state: 'home.comprobantes',
                type: 'link',
                icon: 'view_list'
            }, {
                name: 'Condiciones de IVA',
                state: 'home.taxConditions',
                type: 'link',
                icon: 'view_list'
            }, {
                name: 'Condiciones de Pago',
                state: 'home.condicionVentas',
                type: 'link',
                icon: 'receipt'
            }, {
                name: 'UENs',
                type: 'link',
                state: 'home.subs',
                icon: 'panorama_fisheye',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Categorías',
                state: 'home.categories',
                type: 'link',
                icon: 'apps',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Contactos',
                state: 'home.contacts',
                type: 'link',
                icon: 'person',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Centros de Costo',
                state: 'home.costcenters',
                type: 'link',
                icon: 'view_list',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var config_admin_staff_menu = {
            name: 'Torre de Control',
            type: 'toggle',
            pages: [{
                name: 'Usuarios',
                state: 'home.personal',
                type: 'link',
                icon: 'group_add',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'UENs',
                type: 'link',
                state: 'home.subs',
                icon: 'panorama_fisheye',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Categorías',
                state: 'home.categories',
                type: 'link',
                icon: 'apps',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Contactos',
                state: 'home.contacts',
                type: 'link',
                icon: 'person',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Centros de Costo',
                state: 'home.costcenters',
                type: 'link',
                icon: 'view_list',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var cliente_user_menu = {
            name: 'Pedidos',
            type: 'toggle',
            state: 'home.pedidos',
            pages: [{
                name: 'Nuevo Pedido',
                type: 'link',
                state: 'home.createPedido({ tipo: "venta" })',
                icon: 'add'
            }, {
                name: 'Pedidos',
                state: 'home.pedidos({ tipo: "venta" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }, {
                name: 'Lista de Precios',
                state: 'home.products({tipo: "p"})',
                type: 'link',
                icon: 'style',
                adminOnly: true,
                staffOnly: false
            }]
        };

        var presupuestos_menu = {
            name: 'Ventas',
            type: 'toggle',
            state: 'home.ventas',
            pages: [{
                name: 'Nuevo Presupuesto',
                type: 'link',
                state: 'home.createPedido({ tipo: "venta" })',
                icon: 'add'
            }, {
                name: 'Presupuestos',
                state: 'home.pedidos({ tipo: "venta" })',
                type: 'link',
                icon: 'assignment',
                adminOnly: true,
                staffOnly: false
            }]
        }

        var ventas_menu = {
            name: 'Ventas',
            state: 'home.ventas',
            type: 'link'
        };

        var compras_menu = {
            name: 'Compras',
            state: 'home.compras',
            type: 'link'
        };

        var stock_menu = {
            name: 'Stock',
            state: 'home.stock',
            type: 'link'
        };

        var meetup_menu = {
            name: '#meetUP',
            state: 'home.meetup',
            type: 'link'
        };

        var procesos_menu = {
            name: 'Mis Procesos',
            state: 'home.procesos',
            type: 'link'
        };

        var entregas_menu = {
            name: 'Entregas',
            state: 'home.entregas',
            type: 'link'
        };


        $timeout(function () {
            if (authentication !== '') {
                switch (authentication.roles[0]) {
                    case 'groso':
                        sections.push(ventas_staff_menu);
                        sections.push(compras_staff_menu);
                        sections.push(produccion_menu);
                        sections.push(rrhh_menu);
                        sections.push(impuestos_menu);
                        sections.push(finanzas_menu);
                        sections.push(config_groso_staff_menu);
                        // sections.push(meetup_menu);
                        // sections.push(config_menu);
                        // sections.push(admin_staff_menu);
                        // sections.push(rrhh_menu);
                        // sections.push(ordenes_menu);
                        // sections.push(ventas_menu);
                        // sections.push(compras_menu);
                        // sections.push(entregas_menu);
                        // sections.push(stock_menu);
                        // sections.push(procesos_menu);
                        break;

                    case 'admin':
                        sections.push(ventas_staff_menu);
                        sections.push(compras_staff_menu);
                        sections.push(produccion_menu);
                        sections.push(rrhh_menu);
                        sections.push(impuestos_menu);
                        sections.push(finanzas_menu);
                        sections.push(config_admin_staff_menu);
                        break;

                    case 'user':
                        sections.push(ventas_user_menu);
                        sections.push(compras_user_menu);
                        sections.push(rrhh_user_menu);
                        sections.push(impuestos_menu);
                        sections.push(finanzas_user_menu);
                        break;

                    case 'rrhh':
                        sections.push(rrhh_menu);
                        break;

                    case 'compras':
                        sections.push(compras_user_menu);
                        break;

                    case 'ventas':
                        sections.push(ventas_user_menu);
                        break;

                    case 'produccion':
                        sections.push(presupuestos_menu);
                        sections.push(produccion_user_menu);
                        break;

                    case 'cliente':
                        sections.push(cliente_user_menu);
                        break;

                    default:
                    // sections.push(session_menu);
                }
                ;
            }
        }, 500);

        var self;

        return self = {
            sections: sections,

            toggleSelectSection: function (section) {
                self.openedSection = (self.openedSection === section ? null : section);
            },
            isSectionSelected: function (section) {
                return self.openedSection === section;
            },
            sectionSelected: function () {
                return self.openedSection;
            },
            selectPage: function (section, page) {
                page && page.url && $location.path(page.url);
                self.currentSection = section;
                self.currentPage = page;
            }
        };

        function sortByHumanName(a, b) {
            return (a.humanName < b.humanName) ? -1 :
                (a.humanName > b.humanName) ? 1 : 0;
        }

    }
]);