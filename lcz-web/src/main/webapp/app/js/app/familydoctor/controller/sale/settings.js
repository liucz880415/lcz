"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("SettingsController", ["$scope", "http", "enumData", "fecha",
        function ($scope, http, enumData, fecha) {

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

            $scope.commission = "SCALE";
            $scope.cards = [];
            http.post({
                url: "/settingManage/getReward.do",
                success: function (data) {
                    if (data.length != 0) {
                        angular.forEach(data, function (a) {
                            var card = {};
                            card.cardType = a;
                            card.type = $scope.commission;
                            card.reward = "";
                            $scope.cards.push(card);
                        });
                        $scope.visible = true;
                    }
                }
            });
            $scope.updateAward = function () {
                var blank = true;
                var flag = true;
                angular.forEach($scope.cards, function (data, index) {
                    if ($scope.cards[index].reward) {
                        if ($scope.commission === "SCALE") {
                            if (!(/^(100|[1-9]?\d(\.\d\d?\d?)?)$/.test($scope.cards[index].reward))) {
                                flag = false;
                            }
                        }
                        if ($scope.cards[index].reward <= 0) {
                            flag = false;
                        }
                        blank = false;
                        $scope.cards[index].type = $scope.commission;
                    }
                });
                if (blank === true) {
                    tools.alert("请输入数据！");
                } else if (flag === false) {
                    tools.alert("输入值错误");
                } else {
                    http.post({
                        url: "/settingManage/rewardConfig.do",
                        data: $scope.cards,
                        success: function (data) {
                            tools.alert("设置佣金成功！");
                        }
                    })
                }

            };


            //获取当前日期与前一天日期
            var dataObject = new Date();
            var yesterdayData = dataObject.getFullYear() + "-" + (dataObject.getMonth() + 1) + "-" + (parseInt(dataObject.getDate()) - 1);
            $scope.beginTime = yesterdayData;
            $scope.endTime = fecha.format(new Date(), fecha.YYYYMMDD);

            $scope.data = 'card';
            $scope.export = function () {

                if (!$scope.beginTime || !$scope.endTime) {
                    tools.alert("日期不能为空！");

                } else {
                    var beginTime = new Date($scope.beginTime);
                    var endTime = new Date($scope.endTime);
                    if (beginTime > endTime) {
                        tools.alert("日期出错！");
                    } else {
                        window.location.href = MyConstants.BASE_URL + "/settingManage/dataExport.do?beginTime=" + $scope.beginTime + "&&endTime=" + $scope.endTime + "&&data=" + $scope.data;
                    }
                }

            };


        }
    ]);
});