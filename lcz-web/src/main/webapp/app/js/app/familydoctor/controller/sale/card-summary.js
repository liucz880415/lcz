"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("CardSummaryController", ["$scope", "http", "enumData", "fecha",
        function ($scope, http, enumData, fecha) {

            var currentDate = new Date();

            $scope.queryParams = {
                startTime: null,
                endTime: null
            };

            $scope.queryParams.startTime = fecha.parse(currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-01", fecha.YYYYMMDD);
            $scope.queryParams.endTime = currentDate;

            $scope.querySale = function () {
                http.post({
                    url: "/card/achievement.do",
                    data: $scope.queryParams,
                    success: function (data) {
                        $scope.pageData = data.pageData;
                        $scope.summary = data.summary;
                    }
                });
            };


        }
    ]);
});