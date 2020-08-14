'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider, $scope) {
        // Redirect to home view when route not found
        $urlRouterProvider.when('/', '/authentication/signin');
        $urlRouterProvider.otherwise('/authentication/signin');

        // Home state routing
        $stateProvider.state('home', {
                url: '/',
                abstract: true,
                newButton: false,
                templateUrl: 'modules/core/views/home.client.view.html',
                prevState: 'home.welcome',
            })
            .state('home.welcome', {
                url: 'welcome',
                titulo: 'Bienvenido',
                newButton: false,
                templateUrl: 'modules/core/views/welcome.client.view.html',
                resolve: {
                  serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                  }
                },
                controller: function() {}
            })
            // MEETUP related states
            .state('home.meetup', {
                url: 'meetup',
                titulo: '#MEETUP',
                templateUrl: 'modules/chat/views/chat.client.view.html', //'modules/core/views/meetup.client.view.html',
                prevState: 'home.welcome',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                controller: function() {},
            })
            // MI PERFIL related states
            .state('home.editProfile', {
                url: 'editar-perfil',
                titulo: 'Mi Perfil',
                newButton: false,
                prevState: 'home.welcome',
                templateUrl: 'modules/users/views/settings/edit-profile.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.changeProfilePicture', {
                url: 'cambiar-imagen-perfil',
                titulo: 'Mi Perfil',
                newButton: false,
                prevState: 'home.welcome',
                templateUrl: 'modules/users/views/settings/change-profile-picture.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.changePassword', {
                url: 'cambiar-contraseña',
                titulo: 'Mi Perfil',
                newButton: false,
                prevState: 'home.welcome',
                templateUrl: 'modules/users/views/settings/change-password.client.view.html'
            })
            .state('home.manageSocialAccounts', {
                url: 'cuentas-sociales',
                titulo: 'Mi Perfil',
                newButton: false,
                prevState: 'home.welcome',
                templateUrl: 'modules/users/views/settings/manage-social-accounts.client.view.html'
            })
            // ENTERPRISES related states
            .state('home.enterprises', {
                url: 'empresas',
                titulo: 'Empresas',
                newButton: true,
                prevState: 'home.welcome',
                templateUrl: 'modules/enterprises/views/list-enterprises.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.viewEnterprise', {
                url: 'empresas/view/:enterpriseId',
                titulo: 'Empresas',
                newButton: true,
                prevState: 'home.enterprises',
                templateUrl: 'modules/enterprises/views/view-enterprise.client.view.html'
            })
            .state('home.editEnterprise', {
                url: 'empresas/:enterpriseId/edit',
                titulo: 'Empresas',
                newButton: true,
                prevState: 'home.enterprises',
                templateUrl: 'modules/enterprises/views/edit-enterprise.client.view.html'
            })
            // PRODUCTOS related states
            .state('home.products', {
                url: 'productos?tipo',
                titulo: 'Productos',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'ProductsListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    products: function(Authentication, Products) {
                        return Products.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    clienteCategories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: 'Cliente' });
                    },
                    tipoProducto: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/products/views/list-products.client.view.html'
            })
            .state('home.viewProduct', {
                url: 'productos/view/:productId?back?tipo',
                titulo: '',
                newButton: false,
                prevState: 'home.products',
                controller: 'ProductsViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    product: function($stateParams, Products) {
                        return Products.get({
                            productId: $stateParams.productId
                        });
                    }
                },
                templateUrl: 'modules/products/views/view-product.client.view.html'
            })
            .state('home.editProduct', {
                url: 'productos/:productId/edit?tipo',
                titulo: '',
                newButton: false,
                prevState: 'home.products',
                controller: 'ProductosEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    product: function($stateParams, Products) {
                        return Products.get({
                            productId: $stateParams.productId
                        });
                    },
                    productos: function(Authentication, Products) {
                        return Products.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    clienteCategories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: 'Cliente' });
                    },
                    costCenters: function(Authentication, Costcenters) {
                        return Costcenters.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    providers: function(Authentication, Providers) {
                        return Providers.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoProducto: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/products/views/edit-product.client.view.html'
            })
            .state('home.editValores', {
                url: 'productos/editValores',
                titulo: 'Editar Precios Productos',
                newButton: false,
                prevState: 'home.products',
                templateUrl: 'modules/products/views/edit-valores.client.view.html'
            })
            // CATEGORIES related states
            .state('home.createProduct', {
                url: 'productos/create?tipo',
                prevState: 'home.products',
                titulo: 'Nuevo',
                newButton: false,
                controller: 'ProductosCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    products: function(Products) {
                        return Products;
                    },
                    product: function() {
                        return {}
                    },
                    productos: function(Authentication, Products) {
                        return Products.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    clienteCategories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: 'Cliente' });
                    },
                    providers: function(Authentication, Providers) {
                        return Providers.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    costCenters: function(Authentication, Costcenters) {
                        return Costcenters.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoProducto: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/products/views/create-product.client.view.html'
            })
            // Categories related states
            .state('home.categories', {
                url: 'categorias',
                titulo: 'Categorias',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'CategoriesListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    // category: function(Authentication, Categories){
                    // 	return Categories.get({
                    // 		categoryId: $stateParams.categoryId
                    // 	});
                    // },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    categoryTypes: function() {
                        return ['cliente', 'contacto', 'Insumo', 'Materia Prima', 'Producto', 'producto venta', 'proveedor', 'tipo producto', 'uen', 'venta', 'Remuneracione'];
                    },
                     serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/categories/views/list-categories.client.view.html'
            })
            .state('home.createCategory', {
                url: 'categories/view/create',
                titulo: 'Crear Categoria',
                prevState: 'home.categories',
                newButton: false,
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    }
                },
                templateUrl: 'modules/categories/views/create-category.client.view.html'
            })
            .state('home.viewCategory', {
                url: 'categorias/view/:categoryId',
                titulo: 'Categoria',
                newButton: true,
                prevState: 'home.categories',
                templateUrl: 'modules/categories/views/view-category.client.view.html'
            })
            .state('home.editCategory', {
                url: 'categorias/:categoryId/edit',
                titulo: 'Categoria',
                newButton: true,
                prevState: 'home.categories',
                templateUrl: 'modules/categories/views/edit-category.client.view.html'
            })
            // UENS related states
            .state('home.subs', {
                url: 'UENs',
                titulo: 'UENs',
                newButton: true,
                prevState: 'home.welcome',
                templateUrl: 'modules/subs/views/list-subs.client.view.html'
            })
            .state('home.viewSub', {
                url: 'UENs/view/:subId',
                titulo: 'UEN',
                newButton: true,
                prevState: 'home.subs',
                templateUrl: 'modules/subs/views/view-sub.client.view.html'
            })
            .state('home.editSub', {
                url: 'UENs/:subId/edit',
                titulo: 'UEN',
                newButton: true,
                prevState: 'home.subs',
                templateUrl: 'modules/subs/views/edit-sub.client.view.html'
            })
            // CLIENT related states
            .state('home.clients', {
                url: 'clientes',
                titulo: 'Clientes',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'ClientsListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    clientes: function(Authentication, Clients) {
                        if (Authentication.user.enterprise.enterprise) {
                            return Clients.query({ e: Authentication.user.enterprise.enterprise });
                        }
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/_clients/views/list-clients.client.view.html'
            })
            .state('home.viewClient', {
                url: 'clientes/view/:clientId',
                titulo: 'Cliente',
                newButton: true,
                prevState: 'home.clients',
                controller: 'ClientsViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    client: function($stateParams, Clients) {
                        return Clients.get({
                            clientId: $stateParams.clientId
                        });
                    },
                    products: function(Authentication, Products) {
                        return Products.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    pedidos: function(Authentication, Pedidos) {
                        return Pedidos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    ventas: function(Authentication, Ventas) {
                        return Ventas.query({ e: Authentication.user.enterprise.enterprise, w: 0, y: 0 });
                    },
                },
                templateUrl: 'modules/_clients/views/view-client.client.view.html'
            })
            .state('home.editClient', {
                url: 'clientes/:clientId/edit',
                titulo: 'Cliente',
                newButton: false,
                prevState: 'home.clients',
                controller: 'ClientsEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    clientes: function(Clients) {
                        return Clients;
                    },
                    client: function($stateParams, Clients) {
                        return Clients.get({
                            clientId: $stateParams.clientId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    uens: function(Authentication, Subs) {
                        return Subs.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    condicionventas: function(Authentication, Condicionventas) {
                        return Condicionventas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    categorias: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    contactos: function(Authentication, Contacts) {
                        return Contacts.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    condicionesdeiva: function(Authentication, Taxconditions) {
                        return Taxconditions.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    comprobantes: function(Authentication, Comprobantes) {
                        return Comprobantes.query({ e: Authentication.user.enterprise.enterprise });
                    }
                },
                templateUrl: 'modules/_clients/views/edit-client.client.view.html'
            })
            .state('home.createClient', {
                url: '_clients/view/create',
                titulo: 'Nuevo Cliente',
                newButton: false,
                prevState: 'home.clients',
                controller: 'ClientsCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    clientes: function(Clients) {
                        return Clients;
                    },
                    users: function(Users) {
                        return Users;
                    },
                    client: function() {
                        return {}
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    uens: function(Authentication, Subs) {
                        return Subs.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    condicionventas: function(Authentication, Condicionventas) {
                        return Condicionventas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    categorias: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    contactos: function(Authentication, Contacts) {
                        return Contacts.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    condicionesdeiva: function(Authentication, Taxconditions) {
                        return Taxconditions.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    comprobantes: function(Authentication, Comprobantes) {
                        return Comprobantes.query({ e: Authentication.user.enterprise.enterprise });
                    }
                },
                templateUrl: 'modules/_clients/views/create-client.client.view.html'
            })
            // PROVIDERS related Stated
            .state('home.providers', {
                url: 'proveedores',
                titulo: 'Proveedores',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'ProvidersListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    providers: function(Authentication, Providers) {
                        return Providers.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/providers/views/list-providers.client.view.html'
            })
            .state('home.viewProvider', {
                url: 'proveedores/view/:providerId',
                titulo: 'Proveedor',
                newButton: true,
                prevState: 'home.providers',
                controller: 'ProvidersViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    provider: function($stateParams, Providers) {
                        return Providers.get({
                            providerId: $stateParams.providerId
                        });
                    },
                    products: function(Authentication, Products) {
                        return Products.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    pedidos: function(Authentication, Pedidos) {
                        return Pedidos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    compras: function(Authentication, Compras) {
                        return Compras.query({ e: Authentication.user.enterprise.enterprise, w: 0, y: 0 });
                    }
                },
                templateUrl: 'modules/providers/views/view-provider.client.view.html'
            })
            .state('home.editProvider', {
                url: 'proveedores/:providerId/edit',
                titulo: 'Proveedor',
                newButton: true,
                prevState: 'home.providers',
                controller: 'ProvidersEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    provider: function($stateParams, Providers) {
                        return Providers.get({
                            providerId: $stateParams.providerId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    contacts: function(Authentication, Contacts) {
                        return Contacts.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    taxconditions: function(Authentication, Taxconditions) {
                        return Taxconditions.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    condicionPagos: function(Authentication, Condicionventas) {
                        return Condicionventas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    comprobantes: function(Authentication, Comprobantes) {
                        return Comprobantes.query({ e: Authentication.user.enterprise.enterprise });
                    },
                },
                templateUrl: 'modules/providers/views/edit-provider.client.view.html'
            })
            .state('home.createProvider', {
                url: 'providers/view/create',
                titulo: 'Nuevo Proveedor',
                newButton: false,
                prevState: 'home.providers',
                controller: 'ProvidersCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    provider: function() {
                        return {}
                    },
                    providers: function(Providers) {
                        return Providers;
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    contacts: function(Authentication, Contacts) {
                        return Contacts.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    taxconditions: function(Authentication, Taxconditions) {
                        return Taxconditions.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    condicionPagos: function(Authentication, Condicionventas) {
                        return Condicionventas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    comprobantes: function(Authentication, Comprobantes) {
                        return Comprobantes.query({ e: Authentication.user.enterprise.enterprise });
                    },
                },
                templateUrl: 'modules/providers/views/create-provider.client.view.html'
            })
            // CONTACTS related states
            .state('home.contacts', {
                url: 'contactos',
                titulo: 'Contactos',
                newButton: true,
                prevState: 'home.welcome',
                templateUrl: 'modules/contacts/views/list-contacts.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.createContact', {
                url: 'contactos/view/create',
                titulo: 'Contactos',
                newButton: true,
                prevState: 'home.contacts',
                templateUrl: 'modules/contacts/views/create-contact.client.view.html'
            })
            .state('home.viewContact', {
                url: 'contactos/view/:contactId',
                titulo: 'Contactos',
                newButton: false,
                prevState: 'home.contacts',
                templateUrl: 'modules/contacts/views/view-contact.client.view.html'
            })
            .state('home.editContact', {
                url: 'contactos/:contactId/edit',
                titulo: 'Contactos',
                newButton: false,
                prevState: 'home.contacts',
                templateUrl: 'modules/contacts/views/edit-contact.client.view.html'
            })
            // TaxConditions related states
            .state('home.taxConditions', {
                url: 'condiciones-impuesto',
                titulo: 'Condiciones de impuesto',
                newButton: true,
                prevState: 'home.welcome',
                templateUrl: 'modules/taxconditions/views/list-taxconditions.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.viewTaxCondition', {
                url: 'condiciones-impuesto/view/:taxconditionId',
                titulo: 'Condicion de impuesto',
                newButton: true,
                prevState: 'home.taxConditions',
                templateUrl: 'modules/taxconditions/views/view-taxcondition.client.view.html'
            })
            .state('home.editTaxCondition', {
                url: 'condiciones-impuesto/:taxconditionId/edit',
                titulo: 'Condicion de impuesto',
                newButton: true,
                prevState: 'home.taxConditions',
                templateUrl: 'modules/taxconditions/views/edit-taxcondition.client.view.html'
            })
            // Condicion Ventas related states
            .state('home.condicionVentas', {
                url: 'condiciones-pago',
                titulo: 'Condicion de pago',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'CondicionventasListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    condicionventas: function(Authentication, Condicionventas) {
                        return Condicionventas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/condicionventas/views/list-condicionventas.client.view.html'
            })
            .state('home.createCondicionventa', {
                url: 'condiciones-pago/create',
                titulo: 'Crear Condicion de pago',
                prevState: 'home.condicionVentas',
                newButton: false,
                controller: 'CondicionventasCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    condicionventa: function() {
                        return {}
                    },
                    condicionventas: function(Condicionventas) {
                        return Condicionventas;
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/condicionventas/views/create-condicionventa.client.view.html',
            })
            .state('home.viewCondicionVenta', {
                url: 'condiciones-pago/view/:condicionventaId',
                newButton: true,
                titulo: 'Condicion de pago',
                prevState: 'home.condicionVentas',
                controller: 'CondicionventasViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    condicionventa: function($stateParams, Condicionventas) {
                        return Condicionventas.get({
                            condicionventaId: $stateParams.condicionventaId
                        });
                    }
                },
                templateUrl: 'modules/condicionventas/views/view-condicionventa.client.view.html'
            })
            .state('home.editCondicionVenta', {
                url: 'condiciones-pago/:condicionventaId/edit',
                titulo: 'Condicion de pago',
                newButton: true,
                prevState: 'home.condicionVentas',
                controller: 'CondicionventasEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    condicionventa: function($stateParams, Condicionventas) {
                        return Condicionventas.get({
                            condicionventaId: $stateParams.condicionventaId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/condicionventas/views/edit-condicionventa.client.view.html'
            })
            // Condicion Ventas related states
            .state('home.comprobantes', {
                url: 'comprobantes',
                titulo: 'Comprobantes',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'ComprobantesListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    comprobantes: function(Authentication, Comprobantes) {
                        return Comprobantes.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    modosFacturacion: function() {
                        return ['Comprobante interno', 'Talonario fiscal manual o pre-impreso', 'Factura electronica'];
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/comprobantes/views/list-comprobantes.client.view.html'
            })
            .state('home.createComprobante', {
                url: 'comprobantes/create',
                titulo: 'Crear Comprobante',
                prevState: 'home.comprobantes',
                newButton: false,
                controller: 'ComprobantesCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    comprobante: function() {
                        return {}
                    },
                    comprobantes: function(Comprobantes) {
                        return Comprobantes;
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    modosFacturacion: function() {
                        return ['Comprobante interno', 'Talonario fiscal manual o pre-impreso', 'Factura electronica'];
                    }
                },
                templateUrl: 'modules/comprobantes/views/create-comprobante.client.view.html',
            })
            .state('home.viewComprobante', {
                url: 'comprobantes/view/:comprobanteId',
                titulo: 'Comprobante',
                newButton: true,
                prevState: 'home.comprobantes',
                controller: 'ComprobantesViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    comprobante: function($stateParams, Comprobantes) {
                        return Comprobantes.get({
                            comprobanteId: $stateParams.comprobanteId
                        });
                    }
                },
                templateUrl: 'modules/comprobantes/views/view-comprobante.client.view.html'
            })
            .state('home.editComprobante', {
                url: 'comprobantes/:comprobanteId/edit',
                titulo: 'Comprobante',
                newButton: true,
                prevState: 'home.comprobantes',
                controller: 'ComprobantesEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    comprobante: function($stateParams, Comprobantes) {
                        return Comprobantes.get({
                            comprobanteId: $stateParams.comprobanteId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    modosFacturacion: function() {
                        return ['Comprobante interno', 'Talonario fiscal manual o pre-impreso', 'Factura electronica'];
                    }
                },
                templateUrl: 'modules/comprobantes/views/edit-comprobante.client.view.html'
            })
            // Costcenters related states
            .state('home.costcenters', {
                url: 'centros-costo',
                titulo: 'Costos Indirectos',
                newButton: true,
                prevState: 'home.welcome',
                templateUrl: 'modules/costcenters/views/list-costcenters.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.viewCostcenter', {
                url: 'centros-costo/view/:costcenterId',
                titulo: 'Centro de costo',
                newButton: true,
                prevState: 'home.costcenters',
                templateUrl: 'modules/costcenters/views/view-costcenter.client.view.html'
            })
            .state('home.editCostcenter', {
                url: 'centros-costo/:costcenterId/edit',
                titulo: 'Centro de costo',
                newButton: true,
                prevState: 'home.costcenters',
                templateUrl: 'modules/costcenters/views/edit-costcenter.client.view.html'
            })
            // Tareas related states
            .state('home.tareas', {
                url: 'tareas',
                titulo: 'Tareas',
                newButton: true,
                prevState: 'home.welcome',
                templateUrl: 'modules/tareas/views/list-tareas.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.viewTarea', {
                url: 'tareas/view/:tareaId',
                titulo: 'Tareas',
                newButton: true,
                prevState: 'home.tareas',
                templateUrl: 'modules/tareas/views/view-tarea.client.view.html'
            })
            .state('home.editTarea', {
                url: 'tarea/:tareaId/edit',
                titulo: 'Tarea',
                newButton: true,
                prevState: 'home.tareas',
                templateUrl: 'modules/tareas/views/edit-tarea.client.view.html'
            })
            //empleados
            .state('home.empleados', {
                url: 'empleados',
                titulo: 'Personal',
                newButton: true,
                controller: 'EmpleadosCentrodecostoListController',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    }, 
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/empleados/views/list-empleados-centrodecosto.client.view.html'
            })
            .state('home.listEmpleado', {
                url: 'empleados/:costcenterId',
                newButton: true,
                controller: 'EmpleadosListController',
                titulo: 'Personal',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    }
                },
                templateUrl: 'modules/empleados/views/list-empleados.client.view.html'
            })
            .state('home.viewEmpleado', {
                url: 'empleados/view/:empleadoId',
                titulo: 'Detalle del Personal',
                newButton: true,
                controller: 'EmpleadosController',
                controllerAs: 'vm',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    empleado: function($stateParams, Empleados) {
                        return Empleados.get({
                            empleadoId: $stateParams.empleadoId
                        });
                    },
                    puestos: function(Authentication, Puestos) {
                        return Puestos.query({ e: Authentication.user.enterprise.enterprise });
                    }
                },
                templateUrl: 'modules/empleados/views/view-empleado.client.view.html'
            })
            .state('home.editEmpleado', {
                url: 'empleado/:empleadoId/edit',
                titulo: 'Editar Personal',
                newButton: false,
                controller: 'EmpleadosController',
                controllerAs: 'vm',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    empleado: function($stateParams, Empleados) {
                        return Empleados.get({
                            empleadoId: $stateParams.empleadoId
                        });
                    },
                    puestos: function(Authentication, Puestos) {
                        return Puestos.query({ e: Authentication.user.enterprise.enterprise });
                    }
                },
                templateUrl: 'modules/empleados/views/form-empleado.client.view.html'
            })
            .state('home.createEmpleado', {
                url: 'personas/view/create',
                titulo: 'Nuevo Personal',
                newButton: false,
                prevState: 'home.personal',
                templateUrl: 'modules/personas/views/create-persona.client.view.html'
            })
            // VENTAS related states
            .state('home.ventas', {
                url: 'ventas?tab',
                titulo: 'Ventas',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'ListVentasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/ventas/views/list-ventas.client.view.html'
            })
            .state('home.createVenta', {
                url: 'ventas/view/create',
                titulo: 'Nueva Venta',
                newButton: false,
                prevState: 'home.ventas',
                templateUrl: 'modules/ventas/views/create-venta.client.view.html',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                }
            })
            .state('home.viewVenta', {
                url: 'ventas/view/:ventaId',
                titulo: 'Venta',
                newButton: true,
                prevState: 'home.ventas',
                templateUrl: 'modules/ventas/views/view-venta.client.view.html'
            })
            .state('home.editVenta', {
                url: 'ventas/:ventaId/edit',
                titulo: 'Venta',
                newButton: true,
                prevState: 'home.ventas',
                templateUrl: 'modules/ventas/views/edit-venta.client.view.html'
            })
            .state('home.ventasMostrador', {
                url: 'ventas/mostrador',
                titulo: 'Venta por mostrador',
                newButton: false,
                prevState: 'home.welcome',
                controller: 'VentasMostradorController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/ventas/views/ventas-mostrador.client.view.html'
            })
            // COMPRAS related states
            .state('home.compras', {
                url: 'compras',
                titulo: 'Compras',
                newButton: false,
                prevState: 'home.welcome',
                controller: 'ListComprasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    comprasPendientes: function(Authentication, Compras, $stateParams) {
                        return Compras.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Pendiente de pago y recepcion',
                            p: 0,
                            pcount: 20
                        });
                    },
                    comprasPendientesRecepcion: function(Authentication, Compras, $stateParams) {
                        return Compras.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Pendiente de recepcion',
                            p: 0,
                            pcount: 20
                        });
                    },
                    comprasFinalizadas: function(Authentication, Compras, $stateParams) {
                        return Compras.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Finalizada',
                            p: 0,
                            pcount: 20
                        });
                    },
                    comprasAnuladas: function(Authentication, Compras, $stateParams) {
                        return Compras.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Anulada',
                            p: 0,
                            pcount: 20
                        });
                    },
                    comprasPendienteEvaluacion: function(Authentication, Pedidos, $stateParams) {
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: 'compra',
                            estado: 'pendiente evaluacion',
                            p: 0,
                            pcount: 20
                        });
                    },
                    comprasPendienteAprobacion: function(Authentication, Pedidos, $stateParams) {
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: 'compra',
                            estado: 'pendiente aprobacion',
                            p: 0,
                            pcount: 20
                        });
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/compras/views/list-compras.client.view.html'
            })
            .state('home.createCompra', {
                url: 'compras/create?tipo',
                titulo: 'Nueva Compra',
                newButton: false,
                prevState: 'home.compras',
                controller: 'CreateCompraController',
                resolve: {
                    compras: function(Authentication, Compras) {
                        return Compras.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoCompra: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/compras/views/create-compra.client.view.html'
            })
            .state('home.viewCompra', {
                url: 'compras/view/:compraId',
                titulo: 'View Compra',
                newButton: false,
                prevState: 'home.compras',
                controller: 'ViewCompraController',
                resolve: {
                    compras: function(Authentication, Compras) {
                        return Compras.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    productos: function(Authentication, Products) {
                        return Products.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    compra: function($stateParams, Compras) {
                        return Compras.get({
                            compraId: $stateParams.compraId
                        });
                    }
                },
                templateUrl: 'modules/compras/views/view-compra.client.view.html'
            })
            .state('home.editCompra', {
                url: 'compras/:compraId/edit',
                titulo: 'Edit Compra',
                newButton: true,
                prevState: 'home.compras',
                templateUrl: 'modules/compras/views/edit-compra.client.view.html'
            })
            // STOCK related states
            .state('home.stock', {
                url: 'stocks?tipo',
                titulo: 'Stock',
                prevState: 'home.welcome',
                templateUrl: 'modules/stocks/views/list-stocks.client.view.html',
                controller: 'StocksController',
                resolve: {
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    },
                    costCenters: function(Authentication, Costcenters) {
                        return Costcenters.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise });
                    }
                }
            })
            .state('home.viewStock', {
                url: 'stocks/view/:stockId',
                titulo: 'Stock',
                prevState: 'home.stocks',
                templateUrl: 'modules/stocks/views/view-stock.client.view.html'
            })
            .state('home.editStock', {
                url: 'stocks/:stockId/edit',
                titulo: 'Stock',
                prevState: 'home.stocks',
                templateUrl: 'modules/stocks/views/edit-stock.client.view.html'
            })
            // PEDIDOS related states
            .state('home.pedidos', {
                url: 'pedidos?tipo',
                titulo: 'Pedidos Realizados',
                prevState: 'home.welcome',
                newButton: true,
                controller: 'ListPedidosController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    pedidosEvaluacion: function(Authentication, Pedidos, $stateParams) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: $stateParams.tipo,
                            estado: 'pendiente evaluacion',
                            p: 0,
                            pcount: 20
                        });
                    },
                    pedidosRealizados: function(Authentication, Pedidos, $stateParams) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: $stateParams.tipo,
                            estado: 'pendiente aprobacion',
                            p: 0,
                            pcount: 20
                        });
                    },
                    pedidosAprobados: function(Authentication, Pedidos, $stateParams) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: $stateParams.tipo,
                            estado: 'aprobada',
                            p: 0,
                            pcount: 20
                        });
                    },
                    pedidosRechazados: function(Authentication, Pedidos, $stateParams) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: $stateParams.tipo,
                            estado: 'rechazada',
                            p: 0,
                            pcount: 20
                        });
                    },
                    pedidosBorrador: function(Authentication, Pedidos, $stateParams) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({
                            e: Authentication.user.enterprise.enterprise,
                            tipoPedido: $stateParams.tipo,
                            estado: 'borrador',
                            p: 0,
                            pcount: 20
                        });
                    },
                    tipoOrden: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    tipoPedido: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    ventasPendientesEntrega: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Pendiente de entrega',
                            p: 0,
                            pcount: 20
                        });
                    },
                    ventasFinalizadas: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Finalizada',
                            p: 0,
                            pcount: 20
                        });
                    },
                    ventasPendientes: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Pendiente de pago y entrega',
                            p: 0,
                            pcount: 20
                        });
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/pedidos/views/list-pedidos.client.view.html'
            })
            .state('home.createPedido', {
                url: 'pedidos/create?tipo',
                titulo: 'Nueva Solicitud',
                prevState: 'home.pedidos',
                newButton: false,
                controller: 'CreatePedidosController',
                resolve: {
                    pedidos: function(Authentication, Pedidos) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoOrden: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    tipoPedido: function($stateParams) {
                        return $stateParams.tipo;
                    },
                     serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }

                },
                templateUrl: 'modules/pedidos/views/create-pedido.client.view.html'
            })
            .state('home.viewPedido', {
                url: 'pedidos/view/:pedidoId',
                titulo: 'Orden',
                prevState: 'home.pedidos',
                newButton: false,
                controller: 'ViewPedidosController',
                resolve: {
                    pedidos: function(Authentication, Pedidos) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoOrden: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    tipoPedido: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/pedidos/views/view-pedido.client.view.html'
            })
            .state('home.editPedido', {
                url: 'pedidos/:pedidoId/edit?tipo',
                titulo: 'Orden',
                prevState: 'home.pedidos',
                newButton: true,
                controller: 'PedidosController',
                resolve: {
                    pedidos: function(Authentication, Pedidos) {
                        //console.log('authentication: ', Authentication.user);
                        return Pedidos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoOrden: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    tipoPedido: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/pedidos/views/edit-pedido.client.view.html'
            })
            // Finanzas related states
            .state('home.finanzas', {
                url: 'finanzas?tipo',
                titulo: 'Finanzas',
                prevState: 'home.welcome',
                newButton: false,
                controller: 'ListFinanzasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    movimientos: function(Authentication, Movimientos) {
                        //console.log('authentication: ', Authentication.user);
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoFinanza: function($stateParams) {
                        console.log($stateParams.tipo, 'state params');
                        return $stateParams.tipo;
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }

                },
                templateUrl: 'modules/finanzas/views/list-finanzas.client.view.html'
            })
            .state('home.createFinanza', {
                url: 'finanzas/create?tipo',
                titulo: 'Nueva Solicitud',
                prevState: 'home.finanzas',
                newButton: false,
                controller: 'CreateFinanzasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    finanzas: function(Authentication, Finanzas) {
                        //console.log('authentication: ', Authentication.user);
                        return Finanzas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    finanza: function($stateParams, Finanzas) {
                        return Finanzas.get({
                            finanzasId: $stateParams.finanzaId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    tipoFinanza: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/finanzas/views/create-finanza.client.view.html'
            })
            .state('home.viewFinanza', {
                url: 'finanzas/view/:finanzaId?tipo',
                titulo: 'Finanza',
                prevState: 'home.finanzas',
                newButton: false,
                controller: 'FinanzasViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    finanzas: function(Authentication, Finanzas) {
                        return Finanzas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    finanza: function($stateParams, Finanzas) {
                        return Finanzas.get({
                            finanzaId: $stateParams.finanzaId
                        });
                    },
                    movimientos: function(Authentication, Movimientos) {
                        //console.log('authentication: ', Authentication.user);
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    tipoFinanza: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/finanzas/views/view-finanza.client.view.html'
            })
            .state('home.editFinanza', {
                url: 'finanzas/:finanzaId/edit?tipo',
                titulo: 'Orden',
                prevState: 'home.finanzas',
                newButton: false,
                controller: 'EditFinanzasController',
                controllerAs: 'ctrl',
                resolve: {
                    finanzas: function(Authentication, Finanzas) {
                        //console.log('authentication: ', Authentication.user);
                        return Finanzas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    tipoFinanza: function($stateParams) {
                        return $stateParams.tipo;
                    }
                },
                templateUrl: 'modules/finanzas/views/edit-finanza.client.view.html'
            }).state('home.resumenList', {
                url: 'resumen',
                titulo: 'Resumen económico',
                newButton: false,
                controller: 'ResumenListController',
                resolve: {
                    costcenters: function(Authentication, Costcenters) {
                        return Costcenters.query({ e: Authentication.user.enterprise.enterprise });
                    }
                },
                templateUrl: 'modules/finanzas/views/resumen-list.client.view.html'
            }).state('home.resumen', {
                url: 'resumen/:centroDeCosto',
                titulo: 'Resumen económico',
                prevState: 'home.resumenList',
                newButton: false,
                controller: 'ResumenController',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    }
                },
                templateUrl: 'modules/finanzas/views/resumen.client.view.html'
            })

        // PEDIDOS related states
        .state('home.movimientos', {
                url: 'movimientos',
                titulo: 'Movimientos',
                prevState: 'home.welcome',
                newButton: true,
                controller: 'ListMovimientosController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    movimientos: function(Authentication, Movimientos) {
                        //console.log('authentication: ', Authentication.user);
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/movimientos/views/list-movimientos.client.view.html'
            })
            .state('home.createMovimientos', {
                url: 'movimientos/create?tipo',
                titulo: 'Nuevo Movimiento',
                prevState: 'home.movimientos',
                newButton: false,
                controller: 'CreateMovimientosController',
                controllerAs: 'ctrl',
                resolve: {
                    movimientos: function(Authentication, Movimientos) {
                        //console.log('authentication: ', Authentication.user);
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/movimientos/views/create-movimiento.client.view.html'
            })
            .state('home.viewMovimiento', {
                url: 'movimientos/view/:movimientoId',
                titulo: 'Orden',
                prevState: 'home.movimientos',
                newButton: false,
                controller: 'ViewMovimientoController',
                controllerAs: 'ctrl',
                resolve: {
                    movimientos: function(Authentication, Movimientos) {
                        //console.log('authentication: ', Authentication.user);
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/movimientos/views/view-movimiento.client.view.html'
            })
            .state('home.editMovimiento', {
                url: 'movimientos/:movimientoId/edit',
                titulo: 'Movimiento',
                prevState: 'home.movimientos',
                newButton: true,
                controller: 'EditMovimientosController',
                controllerAs: 'ctrl',
                resolve: {
                    movimientos: function(Authentication, Movimientos) {
                        //console.log('authentication: ', Authentication.user);
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/movimientos/views/edit-movimiento.client.view.html'
            })
            // SUCURSALES related states
            .state('home.sucursales', {
                url: 'sucursales',
                titulo: 'Tesorería',
                newButton: false,
                prevState: 'home.welcome',
                controller: 'SucursalesListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    sucursales: function(Authentication, Sucursales) {
                        return Sucursales.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    cajas: function(Authentication, Cajas) {
                        return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/sucursales/views/list-sucursales.client.view.html'
            })
            .state('home.createSucursal', {
                url: 'sucursales/view/create',
                titulo: 'Crear Tesorería',
                prevState: 'home.sucursales',
                newButton: false,
                controller: 'SucursalesCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    sucursal: function() {
                        return {}
                    },
                    sucursales: function(Sucursales) {
                        return Sucursales;
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/sucursales/views/create-sucursal.client.view.html'
            })
            .state('home.viewSucursal', {
                url: 'sucursales/view/:sucursalId',
                titulo: 'Tesorería',
                newButton: false,
                prevState: 'home.sucursales',
                controller: 'SucursalesViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    cajas: function(Authentication, Cajas) {
                        return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    sucursal: function($stateParams, Sucursales) {
                        return Sucursales.get({
                            sucursalId: $stateParams.sucursalId
                        });
                    }
                },
                templateUrl: 'modules/sucursales/views/view-sucursal.client.view.html'
            })
            .state('home.editSucursal', {
                url: 'sucursales/:sucursalId/edit',
                titulo: 'Editar Tesorería',
                newButton: false,
                prevState: 'home.sucursales',
                controller: 'SucursalesEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    sucursal: function($stateParams, Sucursales) {
                        return Sucursales.get({
                            sucursalId: $stateParams.sucursalId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/sucursales/views/edit-sucursal.client.view.html'
            })
            // CAJAS related states
            .state('home.cajas', {
                url: 'cajas',
                titulo: 'Cajas',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'CajasListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    cajas: function(Authentication, Cajas) {
                        return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    puestos: function(Authentication, Puestos) {
                        return Puestos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/cajas/views/list-cajas.client.view.html'
            })
            .state('home.createCaja', {
                url: 'cajas/view/create',
                titulo: 'Crear Caja',
                prevState: 'home.cajas',
                newButton: false,
                controller: 'CajasCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    caja: function() {
                        return {}
                    },
                    cajas: function(Cajas) {
                        return Cajas;
                    },
                    puestos: function(Authentication, Puestos) {
                        return Puestos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    totalCajas: function(Authentication, Cajas) {
                        return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/cajas/views/create-caja.client.view.html'
            })
            .state('home.viewCaja', {
                url: 'cajas/view/:cajaId',
                titulo: 'Caja',
                newButton: false,
                // prevState: 'home.sucursales'
                prevState: false,
                controller: 'CajasViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    caja: function($stateParams, Cajas) {
                        return Cajas.get({
                            cajaId: $stateParams.cajaId
                        });
                    },/*
                    transferencias: function(Authentication, Transferencias) {
                        return Transferencias.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    arqueos: function(Authentication, Arqueos) {
                        return Arqueos.query({ e: Authentication.user.enterprise.enterprise });
                    },                    
                    movimientos: function(Authentication, Movimientos) {
                        return Movimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    comprasFinalizadas: function(Authentication, Compras, $stateParams) {
                        return Compras.query({ e: Authentication.user.enterprise.enterprise, estado: 'Finalizada' });
                    },
                    ventasPendientes: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Pendiente de pago y entrega'
                        });
                    },
                    ventasPendientesEntrega: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Pendiente de entrega'
                        });
                    },
                    ventasFinalizadas: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Finalizada',
                            p: "0",
                            pcount: 20
                        });
                    },
                    condicionventas: function(Authentication, Condicionventas) {
                        return Condicionventas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    pagosService: function(Authentication, PagosService) {
                        return PagosService.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    ventasAnuladas: function(Authentication, Ventas, $stateParams) {
                        return Ventas.query({
                            e: Authentication.user.enterprise.enterprise,
                            estado: 'Anulada',
                            // pcount: 40
                            pcount: 200000000
                        });
                    },*/
                },
                templateUrl: 'modules/cajas/views/view-caja.client.view.html'
            })
            .state('home.editCaja', {
                url: 'cajas/:cajaId/edit',
                titulo: 'Caja',
                newButton: false,
                prevState: 'home.cajas',
                controller: 'CajasEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    caja: function($stateParams, Cajas) {
                        return Cajas.get({
                            cajaId: $stateParams.cajaId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/cajas/views/edit-caja.client.view.html'
            })
            //TRANSFERENCIAS states
            .state('home.transferencias', {
                url: 'transferencias',
                titulo: 'Transferencias',
                prevState: 'home.welcome',
                newButton: true,
                controller: 'ListTransferenciasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    transferencias: function(Authentication, Transferencias) {
                        //console.log('authentication: ', Authentication.user);
                        return Transferencias.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/transferencias/views/list-transferencias.client.view.html',
            })
            .state('home.createTransferencias', {
                url: 'transferencias/view/create',
                titulo: 'Nueva Transferencia',
                prevState: 'home.transferencias',
                newButton: false,
                controller: 'CreateTransferenciasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    transferencias: function(Authentication, Transferencias) {
                        //console.log('authentication: ', Authentication.user);
                        return Transferencias.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    transferencia: function() {
                        return {}
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/transferencias/views/create-transferencia.client.view.html',
            })
            .state('home.viewTransferencia', {
                url: 'transferencias/view/:transferenciaId',
                titulo: 'Orden',
                prevState: 'home.transferencias',
                newButton: false,
                controller: 'ViewTransferenciaController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    transferencias: function(Authentication, Transferencias) {
                        //console.log('authentication: ', Authentication.user);
                        return Transferencias.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    transferencia: function($stateParams, Transferencias) {
                        return Transferencias.get({
                            transferenciaId: $stateParams.transferenciaId
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/transferencias/views/view-transferencia.client.view.html'
            })
            .state('home.editTransferencia', {
                url: 'transferencias/:transferenciaId/edit',
                titulo: 'Transferencia',
                prevState: 'home.transferencias',
                newButton: true,
                controller: 'EditTransferenciasController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    transferencias: function(Authentication, Transferencias) {
                        //console.log('authentication: ', Authentication.user);
                        return Transferencias.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/transferencias/views/edit-transferencia.client.view.html'
            })
            //Arqueos states
            .state('home.arqueos', {
                url: 'arqueos',
                titulo: 'arqueos',
                prevState: 'home.welcome',
                newButton: true,
                controller: 'ListArqueosController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    arqueos: function(Authentication, Arqueos) {
                        //console.log('authentication: ', Authentication.user);
                        return Arqueos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/arqueos/views/list-arqueos.client.view.html',
            })
            .state('home.createArqueos', {
                url: 'arqueos/view/create',
                titulo: 'Nuevo Arqueo',
                prevState: 'home.arqueos',
                newButton: false,
                controller: 'CreateArqueosController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    arqueos: function(Authentication, Arqueos) {
                        //console.log('authentication: ', Authentication.user);
                        return Arqueos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    arqueo: function() {
                        return {}
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/arqueos/views/create-arqueo.client.view.html',
            })
            .state('home.viewArqueo', {
                url: 'arqueos/view/:arqueoId',
                titulo: 'Orden',
                prevState: 'home.arqueos',
                newButton: false,
                controller: 'ViewArqueoController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    arqueos: function(Authentication, Arqueos) {
                        //console.log('authentication: ', Authentication.user);
                        return Arqueos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    arqueo: function($stateParams, Arqueos) {
                        return Arqueos.get({
                            arqueo: $stateParams.arqueo
                        });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/arqueos/views/view-arqueo.client.view.html'
            })
            .state('home.editArqueo', {
                url: 'arqueos/:arqueoId/edit',
                titulo: 'Arqueos',
                prevState: 'home.arqueos',
                newButton: true,
                controller: 'EditArqueoController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    arqueos: function(Authentication, Arqueos) {
                        //console.log('authentication: ', Authentication.user);
                        return Arqueos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/arqueos/views/edit-arqueo.client.view.html'
            })
            // PROCESOS related states
            .state('home.procesos', {
                url: 'procesos',
                titulo: 'Procesos y Manuales',
                newButton: true,
                prevState: 'home.welcome',
                controller: 'ProcesosListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    procesos: function(Authentication, Procesos) {
                        return Procesos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: "Proceso" });
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/procesos/views/list-procesos.client.view.html'
            })
            .state('home.createProceso', {
                url: 'procesos/view/create',
                titulo: 'Nuevo Proceso',
                newButton: false,
                prevState: 'home.procesos',
                controller: 'ProcesosCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: "Proceso" });
                    },
                    proceso: function() {
                        return {}
                    },
                    procesos: function(Procesos) {
                        return Procesos;
                    },
                    procedimientos: function(Authentication, Procedimientos) {
                        return Procedimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/procesos/views/create-proceso.client.view.html'
            })
            .state('home.viewProceso', {
                url: 'procesos/view/:procesoId',
                titulo: 'Mis Procesos',
                newButton: true,
                prevState: 'home.procesos',
                controller: 'ProcesosViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    proceso: function($stateParams, Procesos) {
                        return Procesos.get({
                            procesoId: $stateParams.procesoId
                        });
                    }
                },
                templateUrl: 'modules/procesos/views/view-proceso.client.view.html'
            })
            .state('home.editProceso', {
                url: 'procesos/:procesoId/edit',
                titulo: 'Mis Procesos',
                newButton: true,
                prevState: 'home.procesos',
                controller: 'ProcesosEditController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    proceso: function($stateParams, Procesos) {
                        return Procesos.get({
                            procesoId: $stateParams.procesoId
                        });
                    },
                    procesos: function(Authentication, Procesos) {
                        return Procesos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    },
                    procedimientos: function(Authentication, Procedimientos) {
                        return Procedimientos.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: "Proceso" });
                    }
                },
                templateUrl: 'modules/procesos/views/edit-proceso.client.view.html'
            })

        // PROCEDIMIENTOS related states
        .state('home.procedimientos', {
                url: 'procedimientos',
                titulo: 'Mis Procedimientos',
                newButton: false,
                prevState: 'home.welcome',
                resolve: {                    
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/procedimientos/views/list-procedimientos.client.view.html'
            })
            .state('home.viewProcedimiento', {
                url: 'procedimientos/view/:procedimientoId',
                titulo: 'Mis Procedimientos',
                newButton: false,
                prevState: 'home.procedimientos',
                templateUrl: 'modules/procedimientos/views/view-procedimiento.client.view.html'
            })
            .state('home.editProcedimiento', {
                url: 'procedimientos/:procedimientoId/edit',
                titulo: 'Mis Procedimientos',
                newButton: false,
                prevState: 'home.procedimientos',
                templateUrl: 'modules/procedimientos/views/edit-procedimiento.client.view.html'
            })
            // personal related states
            .state('home.personal', {
                url: 'personal',
                titulo: 'Usuarios',
                newButton: false,
                prevState: 'home.welcome',
                resolve: {                    
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/personas/views/list-personas.client.view.html'
            })
            .state('home.editUser', {
                url: 'editar-usuario/:personaId',
                titulo: 'Personal',
                newButton: true,
                prevState: 'home.personal',
                templateUrl: 'modules/users/views/settings/edit-user.client.view.html'
            })
            .state('home.createPersonal', {
                url: 'personas/view/create',
                titulo: 'Nuevo Empleado',
                newButton: false,
                prevState: 'home.personal',
                templateUrl: 'modules/personas/views/create-persona.client.view.html'
            })
            .state('home.viewPersona', {
                url: 'personas/view/{personaId}',
                params: {
                    centroDeCosto: "",
                    sueldo: ""
                },
                titulo: 'Personal',
                newButton: true,
                prevState: 'home.personal',
                templateUrl: 'modules/personas/views/view-persona.client.view.html'
            })
            .state('home.editPersonal', {
                url: 'editar-persona/:personaId',
                titulo: 'Personal',
                newButton: true,
                prevState: 'home.personal',
                templateUrl: 'modules/users/views/view-user.client.view.html'
            })
            // rrhh related states
            .state('home.rrhh', {
                url: 'rrhh',
                titulo: 'Organigrama',
                newButton: true,
                prevState: 'home.welcome',
                resolve: {

                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/rrhhs/views/list-rrhhs.client.view.html'
            })
            .state('home.viewRRHH', {
                url: 'rrhh/view/:rrhhId',
                titulo: 'RRHH',
                newButton: true,
                prevState: 'home.rrhh',
                templateUrl: 'modules/rrhhs/views/view-rrhh.client.view.html'
            })
            .state('home.editRRHH', {
                url: 'rrhh/:rrhhId/edit',
                titulo: 'RRHH',
                newButton: true,
                prevState: 'home.rrhh',
                templateUrl: 'modules/rrhhs/views/edit-rrhh.client.view.html'
            })
            // Impuestos related states
            .state('home.impuestos', {
                url: 'impuestos',
                titulo: 'Impuestos',
                prevState: 'home.welcome',
                controller: 'ImpuestosListController',
                controllerAs: 'ctrl',
                resolve: {
                    costcenters: function(Authentication, Costcenters) {
                        return Costcenters.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/impuestos/views/list-impuesto.client.view.html'
            })
            .state('home.viewImpuesto', {
                url: 'impuestos/view/:centroDeCosto',
                titulo: 'Impuestos',
                newButton: false,
                prevState: 'home.impuestos',
                controller: 'ImpuestosViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    }
                },
                templateUrl: 'modules/impuestos/views/view-impuesto.client.view.html'
            })
            .state('home.detailsImpuesto', {
                url: 'impuestos/details/{impuestosId}&{impuestosName}',
                titulo: 'Detalle de Impuesto',
                prevState: 'home.viewImpuesto',
                controller: 'ImpuestosDetailsController',
                controllerAs: 'ctrl',
                templateUrl: 'modules/impuestos/views/details-impuesto.client.view.html'
            })
            .state('home.detailsImpuestoAut', {
                url: 'impuestos/details/{impuestosId}&{impuestosName}&{impuestosType}',
                titulo: 'Detalle de Impuesto',
                prevState: 'home.viewImpuesto',
                controller: 'ImpuestosDetailsController',
                controllerAs: 'ctrl',
                templateUrl: 'modules/impuestos/views/details-impuesto.client.view.html'
            })
            .state('home.createImpuesto', {
                url: 'impuestos/create/:centroDeCosto',
                titulo: 'Crear Impuesto',
                prevState: 'home.viewImpuesto',
                controller: 'ImpuestosCreateController',
                controllerAs: 'ctrl',
                templateUrl: 'modules/impuestos/views/create-impuesto.client.view.html'
            })
            // area related states
            .state('home.area', {
                url: 'areas',
                titulo: 'Áreas',
                newButton: true,
                prevState: 'home.welcome',
                resolve: {                    
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/areas/views/list-areas.client.view.html'
            })
            .state('home.createArea', {
                url: 'areas/view/create',
                titulo: 'Nueva Área',
                newButton: false,
                prevState: 'home.area',
                templateUrl: 'modules/areas/views/create-area.client.view.html'
            })
            .state('home.viewArea', {
                url: 'areas/view/:areaId',
                titulo: 'Áreas',
                newButton: true,
                prevState: 'home.area',
                templateUrl: 'modules/areas/views/view-area.client.view.html'
            })
            .state('home.editArea', {
                url: 'areas/:areaId/edit',
                titulo: 'Áreas',
                newButton: true,
                prevState: 'home.area',
                templateUrl: 'modules/areas/views/edit-area.client.view.html'
            }) // puesto related states
            .state('home.puesto', {
                url: 'puestos',
                titulo: 'Puestos',
                newButton: true,
                prevState: 'home.welcome',
                resolve: {                    
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/puestos/views/list-puestos.client.view.html'
            })
            .state('home.createPuesto', {
                url: 'puestos/view/create',
                titulo: 'Nuevo Puesto De Trabajo',
                newButton: false,
                prevState: 'home.puesto',
                templateUrl: 'modules/puestos/views/create-puesto.client.view.html'
            })
            .state('home.viewPuesto', {
                url: 'puestos/view/{puestoId}',
                params: {
                    personal: "false",
                    centroDeCosto: ""
                },
                titulo: 'Puesto',
                newButton: true,
                prevState: 'home.puesto',
                templateUrl: 'modules/puestos/views/view-puesto.client.view.html'
            })
            .state('home.editPuesto', {
                url: 'puestos/:puestoId/edit',
                titulo: 'Puesto',
                newButton: true,
                prevState: 'home.puesto',
                templateUrl: 'modules/puestos/views/edit-puesto.client.view.html'
            })
            // entregas related states
            .state('home.entregas', {
                url: 'entregas',
                titulo: 'Entregas',
                newButton: true,
                prevState: 'home.welcome',
                resolve: {                    
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/entregas/views/list-entregas.client.view.html'
            })
            .state('home.viewEntrega', {
                url: 'entregas/view/:entregaId',
                titulo: 'Entrega',
                newButton: true,
                prevState: 'home.entregas',
                templateUrl: 'modules/entregas/views/view-entrega.client.view.html'
            })
            .state('home.editEntrega', {
                url: 'entregas/:entregaId/edit',
                titulo: 'Entrega',
                newButton: true,
                prevState: 'home.entregas',
                templateUrl: 'modules/entregas/views/edit-entrega.client.view.html'
            })
            // reportes related Routes
            .state('home.reportes', {
                url: 'reportes?tipo',
                titulo: 'Reportes',
                newButton: false,
                controller: 'ReportesController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    reportesVentas: function(ReportesVentas) {
                        return ReportesVentas;
                    },
                    tipoReporte: function($stateParams) {
                        return $stateParams.tipo;
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/reportes/views/dashboard-reportes.client.view.html'
            })
            .state('home.costosIndirectos', {
                url: 'costosIndirectos/:centroId',
                titulo: 'Costos Indirectos',
                newButton: false,
                prevState: 'home.welcome',
                controller: 'CostosindirectosListController',
                controllerAs: 'ctrl',
                name: null,
                resolve: {
                  user: function(Authentication) {
                      return Authentication.user;
                  },
                  costosindirectosService: function($stateParams, CostosindirectosService) {
                      localStorage.setItem("centroId", $stateParams.centroId);
                      var filterData = {};                        
                      filterData.centroId = $stateParams.centroId;
                      //filterData.enterprise = Authentication.user.enterprise.enterprise;
                      if (localStorage.search_postos) {
                          var data = JSON.parse(localStorage.search_postos);
                          if (data.year)
                              filterData.year = data.year;
                          if (data.month)
                              filterData.month = data.month;

                      }                        
                      return CostosindirectosService.query(filterData);
                  },
                  cajas: function(Authentication, Cajas) {
                      return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                  },
                  enterprises: function(Enterprises) {
                      return Enterprises.query();
                  },
                  costosLastMonthTotal: function($stateParams, LastMonthTotal) {
                      return LastMonthTotal.costosLastMonthTotal($stateParams.centroId);
                  },                  
                   
                },
                templateUrl: 'modules/costosindirectos/views/list-costosindirectos.client.view.html'
            })
            .state('home.createCostosIndirectos', {
                url: 'costosindirectos/view/create',
                titulo: 'Crear costo indirecto',
                prevState: 'home.costosIndirectos',
                newButton: false,
                controller: 'CostosIndirectosCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    costosindirectosService: function(Authentication, CostosindirectosService) {
                        return CostosindirectosService.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    cajas: function(Authentication, Cajas) {
                        return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    enterprises: function(Enterprises) {
                        return Enterprises.query();
                    }
                },
                templateUrl: 'modules/costosindirectos/views/create-costosindirecto.client.view.html'
            })
            .state('home.viewCostosIndirectos', {
                url: 'costosindirectos/view/:costosindirectoId',
                titulo: 'Costos Indirectos',
                newButton: false,
                prevState: 'home.costosIndirectos',
                controller: 'CostosIndirectosViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    serviciosService: function(Authentication, ServiciosService) {                        
                        //search_postos = JSON.parse(localStorage.getItem("search_postos"));
                        var filterData = {};

                        if (localStorage.search_postos)
                            filterData = JSON.parse(localStorage.search_postos);
                        else
                            filterData = { e: Authentication.user.enterprise.enterprise };
                        return ServiciosService.query(filterData);
                    },
                    cajas: function(Authentication, Cajas) {
                        return Cajas.query({ e: Authentication.user.enterprise.enterprise });
                    },
                    costosindirectos: function($stateParams, CostosindirectosService) {
                        return CostosindirectosService.get({
                            costosindirectoId: $stateParams.costosindirectoId
                        });
                    },
                    serviciosLastMonthTotal: function($stateParams, LastMonthTotal) {
                        return LastMonthTotal.serviciosLastMonthTotal();
                    }
                },
                templateUrl: 'modules/costosindirectos/views/view-costosindirecto.client.view.html'

            })
            .state('home.serviceDetails', {
                url: 'costosindirectos/view/',
                titulo: 'Costos Indirectos',
                newButton: false,
                prevState: false,
                //prevState: false,
                controller: 'FinanzasController',
                controllerAs: 'ctrl', 
                resolve: {
                  getServiceDetials: function(Finanzas){
                    console.log($stateParams)
                    return Finanzas.query({serviceId: $stateParams.servicosId,type:"serviceDetials"})
                  }
                },                     
                templateUrl: 'modules/finanzas/views/list-service-details.client.view.html'
            })
            .state('home.viewPago', {
                url: 'pagos/view/{servicosId}&{impuestosId}&{empleadoId}',
                params: {
                  displayName: "",
                  centroDeCosto: ""
                },
                titulo: '',
                newButton: false,
                prevState: false,
                controller: 'PagosViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    pago: function($stateParams, PagosService) {
                       var toList;
                        if($stateParams.servicosId && $stateParams.servicosId !== "") {                            
                            toList = $stateParams.servicosId.split('/');
                            var serviceDetails = toList[toList.length - 1];
                        }
                       
                        if(!toList) {
                            var date = $stateParams.empleadoId ? JSON.parse(localStorage.getItem("dateEmpleados")) : JSON.parse(localStorage.getItem("dateImpuestos"));
                            localStorage.removeItem('serviceName');
                            if (date && (date.month || date.year)) {
                                return PagosService.query({
                                    servicosId: ($stateParams.servicosId) ? toList[0] : undefined,
                                    impuestosId: $stateParams.impuestosId,
                                    empleadoId: $stateParams.empleadoId,
                                    month: "" || null,
                                    year: date.year || null
                                });
                            } else {
                                return PagosService.query({
                                    servicosId: ($stateParams.servicosId) ? toList[0] : undefined,
                                    impuestosId: $stateParams.impuestosId,
                                    empleadoId: $stateParams.empleadoId
                                });
                            }
                        } else {
                            localStorage.setItem('serviceName',toList[1])       
                            return PagosService.query({
                                servicosId: toList[0],
                                type: "serviceDetails"     
                            });
                        }
                    },
                    servicios: function($stateParams, ServiciosService) {
                        if($stateParams.servicosId) {
                            var toList = $stateParams.servicosId.split('/'),
                                serviceDetails = toList[toList.length - 1];
                        }

                       
                        if ($stateParams.servicosId !== '') {
                            return ServiciosService.get({
                                servicioId: toList[0],

                            });
                        } else {
                            return [];
                        }
                        
                    },
                               
                },
                templateUrl: 'modules/pagos/views/view-pago.client.view.html'
            })
            .state('home.viewSaldo', {
                url: 'saldo/view/{servicosId}&{impuestosId}&{empleadoId}',
                params: {
                  displayName: "",
                  centroDeCosto: ""
                },
                titulo: '',
                newButton: false,
                prevState: false,
                controller: 'PagosViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    pago: function($stateParams, PagosService) {
                       var toList;
                        if($stateParams.servicosId && $stateParams.servicosId !== "") {                            
                            toList = $stateParams.servicosId.split('/');
                            var serviceDetails = toList[toList.length - 1];
                        }
                       
                        if(!toList) {
                            var date = $stateParams.empleadoId ? JSON.parse(localStorage.getItem("dateEmpleados")) : JSON.parse(localStorage.getItem("dateImpuestos"));
                            localStorage.removeItem('serviceName');
                            if (date && (date.month || date.year)) {
                                return PagosService.query({
                                    servicosId: ($stateParams.servicosId) ? toList[0] : undefined,
                                    impuestosId: $stateParams.impuestosId,
                                    empleadoId: $stateParams.empleadoId,
                                    month: "" || null,
                                    year: date.year || null
                                });
                            } else {
                                return PagosService.query({
                                    servicosId: ($stateParams.servicosId) ? toList[0] : undefined,
                                    impuestosId: $stateParams.impuestosId,
                                    empleadoId: $stateParams.empleadoId
                                });
                            }
                        } else {
                            localStorage.setItem('serviceName',toList[1])       
                            return PagosService.query({
                                servicosId: toList[0],
                                type: "serviceDetails"     
                            });
                        }
                    },
                    servicios: function($stateParams, ServiciosService) {
                        if($stateParams.servicosId) {
                            var toList = $stateParams.servicosId.split('/'),
                                serviceDetails = toList[toList.length - 1];
                        }

                        if ($stateParams.servicosId !== '') {
                            return ServiciosService.get({
                                servicioId: toList[0],

                            });
                        } else {
                            return [];
                        }
                        
                    },
                               
                },
                templateUrl: 'modules/pagos/views/view-saldo.client.view.html'
            })
            
            .state('home.listcentroDeCosto', {
                url: 'costosindirectos/listcentroDeCosto/',
                titulo: 'Costos Indirectos',
                newButton: false,
                // prevState: 'home.sucursales'
                prevState: false,
                controller: 'CostocentersListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    centrodecosto: function(Authentication, CustomServicios) {
                        localStorage.removeItem("centroId");
                        localStorage.removeItem("search_postos");
                        var e = Authentication.user.enterprise.enterprise;
                        return CustomServicios.getCentroByServicios(e);
                    },
                },
                templateUrl: 'modules/costosindirectos/views/list-centrodecosto.client.view.html'
            })
            .state('home.remuneraciones', {
                url: 'remuneraciones',
                titulo: 'Remuneraciones',
                newButton: true,
                prevState: false,
                controller: 'RemuneracioneListController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    remuneraciones: function(Remuneraciones) {
                        return Remuneraciones.query({});
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/remuneraciones/views/list-remuneraciones.client.view.html'
            }).state('home.viewRemuneracione', {
                url: 'remuneraciones/view/:remuneracioneId',
                titulo: 'Remuneraciones',
                newButton: false,
                prevState: 'home.remuneraciones',
                controller: 'RemuneracioneViewController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    remuneracione: function($stateParams, Remuneraciones) {
                        return Remuneraciones.get({
                            remuneracioneId: $stateParams.remuneracioneId
                        });
                    }
                },
                templateUrl: 'modules/remuneraciones/views/view-remuneracione.client.view.html'
            }).state('home.createRemuneracione', {
                url: 'remuneraciones/create',
                titulo: 'Crear Remuneración',
                newButton: false,
                prevState: 'home.remuneraciones',
                controller: 'RemuneracioneCreateController',
                controllerAs: 'ctrl',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: 'Remuneracione' });
                    },
                    serviceNav: function(ServiceNavigation) {
                        ServiceNavigation.navInit();
                    }
                },
                templateUrl: 'modules/remuneraciones/views/create-remuneracione.client.view.html'
            }).state('home.editRemuneracione', {
                url: 'remuneraciones/:remuneracioneId/edit',
                titulo: 'Editar Remuneración',
                newButton: false,
                prevState: 'home.remuneraciones',
                controller: 'RemuneracioneEditController',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    },
                    remuneracione: function($stateParams, Remuneraciones) {
                        return Remuneraciones.get({
                            remuneracioneId: $stateParams.remuneracioneId
                        });
                    },
                    categories: function(Authentication, Categories) {
                        return Categories.query({ e: Authentication.user.enterprise.enterprise, type1: 'Remuneracione' });
                    }
                },
                templateUrl: 'modules/remuneraciones/views/edit-remuneracione.client.view.html'
            }).state('home.actividades', {
                url: 'actividades',
                params: {
                    empleadoId: null,
                    displayName: "",
                    centroDeCosto: ""
                },
                titulo: 'Actividad',
                newButton: false,
                prevState: false,
                controller: 'ActividadListController',
                templateUrl: 'modules/actividades/views/list-actividades.client.view.html'
            }).state('home.liquidaciones', {
                url: 'liquidaciones',
                params: {
                    empleadoId: null,
                    displayName: "",
                    centroDeCosto: ""
                },
                titulo: 'Liquidaciones',
                newButton: true,    
                prevState: false,
                controller: 'LiquidacionListController',
                templateUrl: 'modules/liquidaciones/views/list-liquidacion.client.view.html'
            })
            
            // .state('home.createLiquidacion', {
            //     url: 'liquidaciones/create',
            //     params: {
            //         empleadoId: null,
            //         liquidacionId: null
            //     },
            //     titulo: 'Crear Liquidación',
            //     newButton: false,
            //     prevState: 'home.liquidaciones',
            //     controller: 'LiquidacionCreateController',
            //     resolve: {
            //         user: function(Authentication) {
            //             return Authentication.user;
            //         }
            //     },
            //     templateUrl: 'modules/liquidaciones/views/create-liquidacion.client.view.html'
            // })

            .state('home.createLiquidacion1', {
                url: 'liquidaciones/create',
                params: {
                    empleadoId: null,
                    liquidacionId: null
                },
                titulo: 'Crear Liquidación',
                newButton: false,
                prevState: 'home.liquidaciones',
                controller: 'LiquidacionCreateController',
                resolve: {
                    user: function(Authentication) {
                        return Authentication.user;
                    }
                },
                templateUrl: 'modules/pagos/views/create-liquidacion.client.view.html'
            })
    }
]);