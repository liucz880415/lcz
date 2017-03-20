"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("EntController", ["$scope", "http", "enumData", "fecha", "modal",
        function ($scope, http, enumData, fecha, modal) {

            $scope.channelList = [];
            $scope.productList = [];
            $scope.typeList = [];
            http.post({
                url: "/card/getProdChannelInfo.do",
                success: function (data) {
                    $scope.channelList = data.channelList;
                    $scope.channelIdList = [];
                    angular.forEach($scope.channelList, function (item) {
                        $scope.channelIdList.push(item.id);
                    });
                    $scope.productIdList = [];
                    $scope.productList = data.productList;
                    angular.forEach($scope.productList, function (item) {
                        $scope.productIdList.push(item.id);
                    });
                    $scope.typeNameList = [];
                    $scope.typeList = data['skuList'];
                    angular.forEach($scope.typeList, function (item) {
                        $scope.typeNameList.push(item['cardType']);
                    });
                }
            });


            $scope.batchProcureCards = function (event) {
                modal.open({
                    url: "procure-card",
                    relatedButton: event.currentTarget,
                    controller: "ProcureCardController",
                    data: {productList: $scope.productList, channelList: $scope.channelList, typeList: $scope.typeList},
                    close: function (data) {
                        $scope.queryProcureCards();
                    }
                });
            };

            $scope.param = {};

            $scope.queryProcureCards = function () {
                http.post({
                    url: "/card/queryProcureCards.do",
                    data: $scope.param,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                })
            };

            $scope.exportProcureCards = function (procureId) {
                window.location.href = MyConstants.BASE_URL + "/card/exportProcureCards.do?procureId=" + procureId;
            };

        }
    ]);

    app.controller("ProcureCardController", ["$scope", "enumData", "http", function ($scope, enumData, http) {

        $scope.procure = {
            cardType: "",
            productId: "",
            channelId: "",
            count: ""
        };

        $scope.productList = $scope.data.productList;
        $scope.channelList = $scope.data.channelList;
        $scope.skuList = $scope.data.typeList;

        var getSkuList = function (list) {
            $scope.skuList = [];
            angular.forEach(list, function (item) {
                //if (item.status == 'NORMAL') {
                $scope.skuList.push(item);
                //}
            });
        };

        getSkuList($scope.data.typeList);

        $scope.procure.channelId = $scope.data.channelList[0].id;
        $scope.procure.productId = $scope.data.productList[0].id;
        $scope.procure.cardType = $scope.skuList[0].cardType;

        $scope.$watch("procure.productId", function () {
            if ($scope.procure.productId) {
                http.get({
                    url: MyConstants.BASE_URL + "/productManage/getSkuList.do?productId=" + $scope.procure.productId,
                    success: function (data) {
                        getSkuList(data);
                        if ($scope.skuList && $scope.skuList.length > 0) {
                            $scope.procure.cardType = $scope.skuList[0].cardType;
                        }
                    }
                });
            }
        });

        $scope.$watch("procure.cardType", function () {
            if (!$scope.procure.cardType) {
                return;
            }
            http.post({
                params: {type: $scope.procure.cardType},
                url: "/card/getLimitCount.do",
                success: function (data) {
                    $scope.limitCount = data;
                }
            });
        });

        $scope.procureCards = function (event) {
            if (!$scope.procure.count) {
                tools.alert("采购数量不能为空");
                return;
            }
            if ($scope.procure.count > $scope.limitCount) {
                tools.alert("采购数量超过了限额");
                return;
            }
            http.post({
                url: "/card/procureCards.do",
                relatedButton: event.currentTarget,
                data: $scope.procure,
                success: function (data) {
                    $scope.close($scope.procure);
                }
            });
        };

        $scope.replaceCountNaN = function () {
            if ($scope.procure.count) {
                $scope.procure.count = $scope.procure.count.replace(/\D/g, '');
            }
        };


    }]);

});