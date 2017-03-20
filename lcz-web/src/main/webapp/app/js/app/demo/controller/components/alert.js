"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("AlertController", ["$scope",
        function ($scope) {

            $scope.alert1 = function () {
                tools.alert("上课的解放路快速点击弗兰克涉及到风口浪尖圣诞快乐分加快速度发的经适房");
            };

            $scope.alert2 = function () {
                tools.alert("上课的解放路快速点击弗兰克涉及到风口浪尖圣诞快乐分加快速度发的经适房", function () {
                }, function () {
                });
            };

            $scope.alert3 = function () {
                tools.alert("上课的解放路快速点击弗兰克涉及到风口浪尖圣诞快乐分加快速度发的经适房", {
                    "是": function () {
                    },
                    "否": function () {
                    },
                    "取消": function () {
                    }
                });
            };

            $scope.alert4 = function () {
                tools.timerAlert("上课的解放路快速点击弗兰克涉及到风口浪尖圣诞快乐分加快速度发的经适房");
            };
        }
    ]);
});