"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("TableController", ["$scope", "$timeout", "http",
        function ($scope, $timeout, http) {
            $scope.dataComparison = [{
                label: "id",
                data: "id"
            }, {
                label: "用户id",
                data: "userId"
            }, {
                label: "产品id",
                data: "productId"
            }];

            $scope.executeQuery = false;

            $scope.queryParams = {
                mobile: "",
                userId: ""
            };

            $timeout(function () {
                $scope.executeQuery = true;
            }, 3000);

            $scope.query = function () {
                http.post({
                    url: "orderManage/queryOrderList.do",
                    data: $scope.queryParams,
                    success: function (pageData) {
                        $scope.pageData = pageData;
                    }
                });
            };
        }
    ]);
});