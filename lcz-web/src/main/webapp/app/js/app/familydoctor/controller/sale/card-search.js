"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("CardSearchController", ["$scope", "http", "enumData", "fecha",
        function ($scope, http, enumData, fecha) {

            $scope.param = {
                cardNo: ""
            };

            http.get({
                url: MyConstants.BASE_URL + "/productManage/getSkuList.do",
                success: function (data) {
                    $scope.typeList = data;
                    $scope.typeNameList = [];
                    angular.forEach($scope.typeList, function (item) {
                        $scope.typeNameList.push(item['cardType']);
                    });
                }
            });

            $scope.queryList = function () {
                $scope.executeQuery = true;
                http.post({
                    url: "/card/queryCards.do",
                    data: $scope.param,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                });
            };

            $scope.changeStatus = function (item) {
                http.post({
                    url: "/card/cardStatus.do",
                    data: {cardNo: item.cardNo},
                    success: function (data) {
                        $scope.executeQuery = true;
                        tools.alert("作废成功");
                    }
                });
            };
        }
    ]);
});