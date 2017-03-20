"use strict";
define(["main-app"], function (app) {
    app.factory("cache", ["destroy",
        function (destroy) {
            var constants = {
                "KEY_SEARCH": "KEY_SEARCH"
            };

            var data = {};
            var autoDestroyData = {};

            destroy.addDestroyListener(function () {
                autoDestroyData = {};
            });

            var addData = function (module, key, value) {
                if (!data.hasOwnProperty(module)) {
                    data[module] = {};
                }
                data[module][key] = value;
            };

            var getData = function (module, key) {
                if (!data.hasOwnProperty(module)) {
                    data[module] = {};
                }
                return data[module][key];
            };

            var addAutoDestroyData = function (module, key, value) {
                if (!autoDestroyData.hasOwnProperty(module)) {
                    autoDestroyData[module] = {};
                }
                autoDestroyData[module][key] = value;
            };

            var getAutoDestroyData = function (module, key) {
                if (!autoDestroyData.hasOwnProperty(module)) {
                    autoDestroyData[module] = {};
                }
                return autoDestroyData[module][key];
            };

            var getAutoDestroyAllKey = function (module) {
                if (!autoDestroyData.hasOwnProperty(module)) {
                    autoDestroyData[module] = {};
                }
                var keyArray = [];
                for (var key in autoDestroyData[module]) {
                    keyArray.push(key);
                }
                return keyArray;
            };

            return {
                constants: constants,
                addData: addData,
                getData: getData,
                addAutoDestroyData: addAutoDestroyData,
                getAutoDestroyData: getAutoDestroyData,
                getAutoDestroyAllKey: getAutoDestroyAllKey
            };
        }
    ]);
});