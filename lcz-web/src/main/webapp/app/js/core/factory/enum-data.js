"use strict";
define(["main-app"], function (app) {
    app.factory("enumData", ["userConfig",
        function (userConfig) {

            var enumData = userConfig.get(userConfig.constants.ENUM_DATA);

            var getAllData = function () {
                return angular.copy(enumData);
            };

            var getData = function (className, label) {
                var list = getList(className);
                for (var i = 0; i < list.length; i++) {
                    if (list[i]["label"] === label) {
                        return list[i]["data"];
                    }
                }
                return null;
            };

            var getLabel = function (className, data) {
                var list = getList(className);
                for (var i = 0; i < list.length; i++) {
                    if (list[i]["data"] === data) {
                        return list[i]["label"];
                    }
                }
                return null;
            };

            var getList = function (className) {
                try {
                    return angular.copy(getAllData()[className])
                } catch (e) {
                    enumData.refresh(true);
                }
            };

            return {
                getData: getData,
                getLabel: getLabel,
                getList: getList,
                getAllData: getAllData
            };
        }
    ]);
});