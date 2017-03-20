"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("SaleSearchController", ["$scope", "http",
        function ($scope, http) {
            $scope.salers = [];
            $scope.querySaler = function () {
                if(!$scope.userName&&!$scope.mobile)
                {
                    tools.alert("手机和电话号不能都为空");
                }else{
                    http.post({
                        url: "/user/saler.do",
                        data: {
                            userName: $scope.userName,
                            mobile: $scope.mobile
                        },
                        success: function (data) {
                            $scope.salers = data;
                        }
                    })
                }

            };
            $scope.cardList = [];
            $scope.param={
                userId:"",
                userName:"",
                mobile:""
            };
            $scope.queryList2 = function (item) {
                $scope.param.userId = item.userId;
                $scope.param.userName = item.userName;
                $scope.param.mobile = item.mobile;
                $scope.executeQuery = true;
            };

            $scope.queryList = function () {
                http.post({
                    url: "/user/salerCard.do",
                    data: $scope.param,
                    success: function (data) {
                        $scope.cardList = data;
                    }
                });
            };

        }
    ]);
});