"use strict";
define(["main-app", "tools"], function (app, tools) {

    app.controller("IndexController", ["$scope", "$rootScope", function ($scope, $rootScope) {
        $rootScope.baseUrl = MyConstants.BASE_URL;
        $rootScope.fileUtl = MyConstants.FILE_URL;
    }]);

    //空
    app.controller("NoneController", ["$scope", function ($scope) {

    }]);

    //登录
    app.controller("LoginModalController", ["$scope", "$rootScope", "http", "md5", "cookie", "validator", "storage", "userConfig",
        function ($scope, $rootScope, http, md5, cookie, validator, storage, userConfig) {
            $scope.baseUrl = MyConstants.BASE_URL;

            $scope.username = cookie.getCookie("username");
            $scope.password = "";
            $scope.errorMessage = "";

            var loginValidator = validator.create("LoginForm", $scope);
            $scope.login = function (event, target) {
                if (!target) {
                    target = event.currentTarget;
                }
                var username = $scope.username;
                $scope.errorMessage = "";
                loginValidator.validateNow(function () {
                    http.post({
                        url: "j_spring_security_check",
                        data: {
                            username: $scope.username,
                            password: md5($scope.password)
                        },
                        relatedButton: target,
                        relatedButtonText: "登录中",
                        success: function (data) {
                            if (!data.success) {
                                $scope.password = "";
                                $scope.errorMessage = data.message;
                            } else {
                                cookie.setCookie("username", username);
                                $(target).attr("disabled", "disabled");
                                storage.setLocalStorageObject(storage.constants.USER_CONFIG, data["userConfig"]);
                                $scope.close(true);
                                $rootScope.username = userConfig.get(userConfig.constants.USER_NAME);
                            }
                        }
                    });
                }, tools.noop, target);
            };

            $scope.inputKeyUp = function (event) {
                if (event.keyCode == 13) {
                    $scope.login(null, $scope.element.find("#loginButton"));
                }
            };
        }
    ]);
});