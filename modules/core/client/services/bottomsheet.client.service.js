'use strict';

/*
  ~~~~~~ buttons array model

  buttons = [
    {
      name: 'view',
      label: 'View',
      icon: 'viewIcon'
    }
  ]
*/

// Create the Socket.io wrapper service
angular.module('core').service('BottomSheetService', ['$mdBottomSheet',
  function($mdBottomSheet) {

    var sheet = function($event, buttons, callback) {
      $mdBottomSheet.show({
        controller: BottomSheetController,
        templateUrl: '/modules/core/views/dynamic-bottomsheet.html',
        // controller: 'ListBottomSheetCtrl',
        targetEvent: $event,
        resolve: {
          buttons: function() {
            return buttons;
          }
        }

      }).then(function(clickedItem) {
        callback(null, clickedItem)
      }, function() {
        console.log('rejected!!!');
        callback('rejected');
      })
    };

    function BottomSheetController($scope, buttons) {

      $scope.items = buttons;

      $scope.clickHandler = function(name) {
        console.log("name");
        console.log(name);
        $mdBottomSheet.hide(name);
      }
    }

    return {
      sheet: function($event, buttons, callback) {
        sheet($event, buttons, callback);
      }
    }
  }

]);
