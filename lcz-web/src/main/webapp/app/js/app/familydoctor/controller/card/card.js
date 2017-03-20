"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("CardController", ["$scope", "http", "enumData", "modal",
        function ($scope, http, enumData, modal) {

            $scope.cardPoolTypeList = enumData.getList("CardPoolType");
            $scope.queryParams = {
                cardNo: "",
                type: "",
                available: ""
            };

            $scope.available = "";

            $scope.queryCards = function () {

                http.post({
                    url: "card/queryPoolCards.do",
                    data: $scope.queryParams,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                });

            };
        }
    ]);
});