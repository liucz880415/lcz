"use strict";
define(["main-app", "jquery"], function (app, $) {
    app.factory("windowResize", ["destroy",
        function (destroy) {
            var handlerArray = [];
            var handlerDestroyArray = [];

            var delayTimer = null;
            var _window = $(window);
            _window.resize(function () {
                angular.forEach(handlerArray, function (handler) {
                    handler(_window.width(), _window.height());
                });
                angular.forEach(handlerDestroyArray, function (handler) {
                    handler(_window.width(), _window.height());
                });
                if (delayTimer) {
                    clearTimeout(delayTimer);
                }
                delayTimer = setTimeout(function () {
                    clearTimeout(delayTimer);
                    angular.forEach(handlerArray, function (handler) {
                        handler(_window.width(), _window.height());
                    });
                    angular.forEach(handlerDestroyArray, function (handler) {
                        handler(_window.width(), _window.height());
                    });
                }, 100);
            });

            var addHandler = function (handler, immediately) {
                handlerArray.push(handler);
                if (immediately !== false) {
                    setTimeout(function () {
                        handler(_window.width(), _window.height());
                    }, 200);
                }
            };

            var addHandlerAndDestroy = function (handler, immediately) {
                handlerDestroyArray.push(handler);
                if (immediately !== false) {
                    setTimeout(function () {
                        handler(_window.width(), _window.height());
                    }, 200);
                }
            };

            destroy.factoryAddDestroyListener(function () {
                if (handlerDestroyArray.length > 0) {
                    handlerDestroyArray.splice(0, handlerDestroyArray.length);
                }
            });
            return {
                addHandler: addHandler,//添加window大小变化的时间监听 切换NG-VIEW时不会销毁
                addHandlerAndDestroy: addHandlerAndDestroy//添加window大小变化的时间监听 切换NG-VIEW时会销毁
            };
        }
    ]);
});