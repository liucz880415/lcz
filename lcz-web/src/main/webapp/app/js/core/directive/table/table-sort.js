"use strict";
define(["main-app"], function (app) {

    app.directive("tableSort", ["$timeout", function ($timeout) {
        return {
            scope: {
                jyaId: "@"//字段ID
            },
            restrict: "E",
            templateUrl: MyConstants.FILE_URL + "/js/core/directive/table/table-sort.html?vid=" + MyConstants.VERSION,
            replace: true,
            link: function ($scope, element) {
                $scope.jyQueryParams = $scope.$parent.$$childHead.jyQueryParams;
                $scope.sort = function () {
                    if ($scope.$parent.$$childHead.loading) {
                        return;
                    }
                    if ($scope.jyQueryParams.sortAsc == null || $scope.jyaId != $scope.jyQueryParams.sortId) {
                        $scope.jyQueryParams.sortId = $scope.jyaId;
                        $scope.jyQueryParams.sortAsc = false;
                    } else if ($scope.jyQueryParams.sortAsc == false) {
                        $scope.jyQueryParams.sortId = $scope.jyaId;
                        $scope.jyQueryParams.sortAsc = true;
                    } else {
                        $scope.jyQueryParams.sortId = null;
                        $scope.jyQueryParams.sortAsc = null;
                    }
                    $scope.$parent.$$childHead.query();
                };
            }
        };
    }]);
});