'use strict';

//Pedidos service used to communicate Pedidos REST endpoints
angular.module('pedidos').factory('Pedidos', ['$resource',
	function($resource) {
		return $resource('api/pedidos/:pedidoId', { pedidoId: '@_id', e: '@enterprise', w: '@filterDate.week', y: '@filterDate.year', tipoPedido: '@tipoPedido', estado: '@estado', p: '@p', pcount: '@pcount'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('Modal', function() {
	var tipo;
	var proveedor;
	var empresa;
	var contactos = [];
	var categorias = [];
	var subcategorias = [];
	var condiciones = [];//tax
	var condicionesVentas = [];
	var comprobantes = [];
	var subs = [];
	var proveedores = [];
	var taxes = [];
	var metrics = [];
	return{
	    getTipo: function(){
	      return tipo;
	    },
	    setTipo: function(value){
	      tipo = value;
	    },
	    getProveedor: function(){
	      return proveedor;
	    },
	    setProveedor: function(prov){
	      proveedor = prov;
	    },
	    getContactos: function(){
	      return contactos;
	    },
	    setContactos: function(value){
	      contactos = value;
	    },
	    getCategorias: function(){
	      return categorias;
	    },
	    setCategorias: function(value){
	      categorias = value;
	    },
	    getSubcategorias: function(){
	      return subcategorias;
	    },
	    setSubcategorias: function(value){
	      subcategorias = value;
	    },
	    //tax
	    getCondiciones: function(){
	      return condiciones;
	    },
	    setCondiciones: function(value){
	      condiciones = value;
	    },
	    getCondicionesVentas: function(){
	      return condicionesVentas;
	    },
	    setCondicionesVentas: function(value){
	      condicionesVentas = value;
	    },
	    getComprobantes: function(){
	      return comprobantes;
	    },
	    setComprobantes: function(value){
	      comprobantes = value;
	    },
	    getEmpresa: function(){
	      return empresa;
	    },
	    setEmpresa: function(value){
	      empresa = value;
	    },
	    getSubs: function(){
	      return subs;
	    },
	    setSubs: function(value){
	      subs = value;
	    },
	    getProveedores: function(){
	      return proveedores;
	    },
	    setProveedores: function(value){
	      proveedores = value;
	    },
	    getTaxes: function(){
	      return taxes;
	    },
	    setTaxes: function(value){
	      taxes = value;
	    },
	    getMetrics: function(){
	      return metrics;
	    },
	    setMetrics: function(value){
	      metrics = value;
	    },
	}
});
