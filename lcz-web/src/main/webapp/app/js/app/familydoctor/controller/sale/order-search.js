"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("OrderSearchController", ["$scope", "http",
        function ($scope, http) {


            $scope.param = {
                userName: "",
                mobile: "",
                no: ""
            };

            $scope.queryList = function () {
                http.post({
                    url: "/orderManage/queryList.do",
                    data: $scope.param,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                });
            };

        }
    ]);
});