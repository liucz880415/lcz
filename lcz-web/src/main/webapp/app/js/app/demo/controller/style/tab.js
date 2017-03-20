"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("TabController", ["$scope",
        function ($scope) {
            $scope.tabIndex = 0;
        }
    ]);
});