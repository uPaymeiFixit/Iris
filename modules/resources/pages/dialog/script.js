var ngApp;
(function () {
    ngApp = angular.module('dialog', []);

    ngApp.controller('DialogController', ['$scope', function ($scope) {
        $scope.question = 'test';
    }]);
})();
