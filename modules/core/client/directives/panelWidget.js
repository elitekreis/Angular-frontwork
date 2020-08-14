'use strict';

angular.module('core')
  .directive('panelWidget', function() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: { title: '@', template: '@', options: '@' },
      template: '' +
      '<section layout-margin class="md-whiteframe-5dp panel-widget">' +
      '  <md-toolbar md-theme="custom" class="panel-widget-toolbar">' +
      '    <div class="md-toolbar-tools">' +
      '      <h3 class="panel-widget-tittle">{{title}}</h3>' +
      '      <span flex></span>' +
      '      <md-button ng-show="options" ng-click="$showOptions = !$showOptions" class="md-icon-button" aria-label="Show options">' +
      '        <div style="padding-top:8px"><ng-md-icon icon="more_vert"></ng-md-icon></div>' +
      '      </md-button>' +
      '    </div>' +
      '  </md-toolbar>' +
      '  <div class="md-padding" ng-include="template"></div>' +
      '</section>',
      compile: function(element, attrs, linker) {
        return function(scope, element) {
          linker(scope, function(clone) {
            element.append(clone);
          });
        };
      }
    };
  });
