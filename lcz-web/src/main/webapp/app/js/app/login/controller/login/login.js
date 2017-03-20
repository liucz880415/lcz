"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("LoginController", ["$scope", "http", "validator", "storage", "md5", "userConfig", "cookie",
        function ($scope, http, validator, storage, md5, userConfig, cookie) {

            $scope.username = cookie.getCookie("username");
            $scope.password = "";
            $scope.errorMessage = "";

            $scope.loginMessage = {
                isLogin: false,
                username: ""
            };

            storage.getLocalStorageOrOtherObject(storage.constants.MANAGE_USER_LOGIN_MESSAGE, function (deferred) {
                http.get({
                    url: "user/isLogin.do",
                    offTimeout: true,
                    success: function (data) {
                        deferred.resolve({
                            isLogin: data,
                            username: userConfig.get(userConfig.constants.USER_NAME, "", true)
                        });
                    }
                });
            }, function (data) {
                $scope.loginMessage = data;
                if (!$scope.loginMessage.isLogin) {
                    if (!$scope.username) {
                        $("input[name='username']").focus();
                    } else {
                        $("input[name='password']").focus();
                    }
                }
            }, true);

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
                                window.location.href = MyConstants.FILE_URL + "/view/familydoctor/index.html?version=" + MyConstants.VERSION;
                            }
                        }
                    });
                }, tools.noop, target);
            };

            $scope.inputKeyUp = function (event) {
                if (event.keyCode == 13) {
                    $scope.login(null, $("#loginButton"));
                }
            };

            $scope.enter = function () {
                window.location.href = MyConstants.FILE_URL + "/view/familydoctor/index.html?version=" + MyConstants.VERSION;
            };
        }
    ]);
});