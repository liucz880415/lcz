"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("KeySearchSelectController", ["$scope",
        function ($scope) {

            $scope.selectedItem = null;

            $scope.callBack = function () {
                tools.timerAlert("回调了")
            };
        }
    ]);
});