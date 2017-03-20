"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("ModalController", ["$scope", "modal",
        function ($scope, modal) {
            $scope.open = function (event) {
                modal.open({
                    url: "modal",
                    relatedButton: event.currentTarget
                });
            };
        }
    ]);

    app.controller("OpenModalController", ["$scope", function ($scope) {
        $scope.alert = function () {
            tools.alert(1);
        };
    }]);
});