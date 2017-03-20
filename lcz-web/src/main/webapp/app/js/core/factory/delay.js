"use strict";
define(["main-app"], function (app) {
    app.factory("delay", ["$timeout", function ($timeout) {
        return function (callBack, time) {
            var timer = null;
            if (!time) {
                time = 300;
            }
            return {
                trigger: function (value) {
                    if (timer) {
                        $timeout.cancel(timer);
                    }
                    timer = $timeout(function () {
                        callBack(value);
                    }, time);
                }
            }
        };
    }]);
});