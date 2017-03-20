"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("GenController", ["$scope", "http","enumData",
        function ($scope, http,enumData) {

            $scope.type = "NORMAL";
            $scope.initCard = function () {

                if (!(/^[0-9]*[1-9][0-9]*$/.test($scope.num)) || $scope.num < 0) {
                    tools.alert("请正确输入卡数！");
                } else if ($scope.num > 100000) {
                    tools.alert("卡数不能大于10万！");
                }else {

                    http.post({
                        responseType: "json",
                        url: '/card/initCard.do',
                        params: {type: $scope.type, num: $scope.num},
                        success: function (data) {
                            tools.timerAlert("生成卡成功！");
                        }
                    });

                }
            };

            $scope.initCardExp = function () {
                http.post({
                    url: '/card/initCardExp.do',
                    data: {},
                    success: function (data) {
                        tools.timerAlert("批量赠予体检卡成功！");
                    }
                });


            };


        }
    ]);
});