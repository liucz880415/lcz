"use strict";
define(["main-app", "tools"], function (app, tools) {
    app.directive("indexHead", ["$rootScope", "userConfig", "http",
        function ($rootScope, userConfig, http) {
            return {
                restrict: 'E',
                templateUrl: MyConstants.FILE_URL + "/js/core/directive/index-head/index-head.html?vid=" + MyConstants.VERSION,
                link: function ($scope, element) {
                    $scope.exit = function () {
                        window.location.href = MyConstants.BASE_URL + "/j_spring_security_logout"
                    };
                    $rootScope.username = userConfig.get(userConfig.constants.USER_NAME);
                }
            };
        }
    ]);
});