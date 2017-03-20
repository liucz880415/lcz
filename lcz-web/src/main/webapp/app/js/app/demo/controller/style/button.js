"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("ButtonController", ["$scope", "http",
        function ($scope, http) {
            http.get({
                url: "user/findUserConfig.do",
                success: function () {

                }
            });
        }
    ]);
});