"use strict";
define(["main-app"], function (app) {
    app.factory("destroy", [
        function () {
            var handlers = [];
            var addDestroyListener = function (handler) {
                handlers.push(handler);
            };

            var factoryHandlers = [];
            var factoryAddDestroyListener = function (handler) {
                factoryHandlers.push(handler);
            };

            var execute = function () {
                angular.forEach(handlers, function (handler) {
                    try {
                        handler();
                    } catch (e) {
                        console.log(e);
                    }
                });
                angular.forEach(factoryHandlers, function (handler) {
                    try {
                        handler();
                    } catch (e) {
                        console.log(e);
                    }
                });
                handlers = [];
            };
            return {
                addDestroyListener: addDestroyListener,
                factoryAddDestroyListener: factoryAddDestroyListener,//factory只初始化一次 所以不能被销毁 但需要被调用
                execute: execute
            };
        }
    ]);
});