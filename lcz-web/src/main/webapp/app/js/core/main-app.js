"use strict";
define(["angular", "main-data", "jquery", "tools", "angular-route", "angular-animate", "angular-ui-mask"], function (angular, mainData, $, tools) {

    var app = angular.module("jianyi", ["ngRoute", "ngAnimate", "ui.mask"]);

    app.config(["$routeProvider", "$provide", function ($routeProvider, $provide) {
        $routeProvider.when("/:view", {
            templateUrl: function ($routeParams) {
                var view = $routeParams.view;
                if (mainData["alias"] != null && mainData["alias"][view] != null) {
                    view = mainData["alias"][view];
                }
                return MyConstants.FILE_URL + "/view/" + mainData.module + "/" + view.split(".").join("/") + ".html?vid=" + MyConstants.VERSION;
            },
            reloadOnSearch: false
        }).otherwise({
            redirectTo: "/" + mainData["index"]
        });
        $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {
            return function (exception, cause) {
                //var http = app.get("http");
                //http.post({
                //    url: "/common/saveException.do",
                //    data: {
                //        stackTrace: exception.stack,
                //        message: exception.message
                //    }
                //});
                $delegate(exception, cause);
            }
        }]);
    }]);

    app.run(["$rootScope", function ($rootScope) {
        var body = $("body");
        $rootScope.$on("$routeChangeStart", function (event, newUrl, oldUrl) {
            $rootScope.$broadcast("routeChangeStart", event, newUrl, oldUrl);
            if (event.defaultPrevented) {
                return;
            }
            $rootScope.lastPath = oldUrl ? oldUrl.params.view : null;
            document.activeElement.blur();
        });

        $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
            $rootScope.$broadcast("routeChangeSuccess", event, current, previous);
            $rootScope.lastRouteChangeSuccessUrl = app.get("$location").path().replace("\/", "");
            tools.destroy();
            app.get("destroy").execute();
        });

        $rootScope.$on("$viewContentLoaded", function () {

        });

        $rootScope.$on("$routeChangeError", function (event, current, previous) {
            $rootScope.$broadcast("routeChangeError", event, current, previous);
            var $location = app.get("$location");
            if ($rootScope.lastRouteChangeSuccessUrl) {
                $location.path($rootScope.lastRouteChangeSuccessUrl);
            } else {
                $location.path("/" + mainData.index);
            }
            $location.replace();
        });
    }]);

    //模块开发不要使用以下方法
    app.get = function (ngObject) {
        if (app.$injector == null) {
            app.$injector = angular.element(document.body).injector();
        }
        return app.$injector.get(ngObject);
    };
    app.invoke = function (ngFunction) {
        if (app.$injector == null) {
            app.$injector = angular.element(document.body).injector();
        }
        return app.$injector.invoke(ngFunction);
    };

    //公共filter
    if (window.localStorage && window.localStorage["USER_CONFIG"]) {
        var enumData = JSON.parse(window.localStorage["USER_CONFIG"])["enumData"];
        for (var key in enumData) {
            (function (_key) {
                app.filter(_key + "Filter", function () {
                    return function (item, defaultValue) {
                        for (var i = 0; i < enumData[_key].length; i++) {
                            if (item === enumData[_key][i]["data"]) {
                                return enumData[_key][i]["label"]
                            }
                        }
                        return defaultValue ? defaultValue : "";
                    }
                });
            })(key);
        }
    }

    /**
     * 为避免缓存数据被用户删除后导致filter出错 使用这个filter做一层转换 如果不存在不会出错
     */
    app.filter("SafeGetFilter", function () {
        return function (item, filter, defaultValue) {
            try {
                return app.get("$filter")(filter)(item, defaultValue);
            } catch (e) {
                return "";
            }
        };
    });
    app.filter("Html", function () {
        return function (value) {
            try {
                if (!angular.isString(value)) {
                    value = value ? value.toString() : "";
                }
                return app.get("$sce").trustAsHtml(value);
            } catch (e) {
            }
            return value;
        }
    });

    app.filter("TrueOrFalseFilter", function () {
        return function (item) {
            if (item === true) {
                return "是";
            } else if (item === false) {
                return "否";
            }
            return "";
        }
    });

    app.filter("DoubleFilter", function () {
        return function (item) {
            if (!item && item != 0) {
                return "";
            }
            return Math.round(item * 10) / 10;
        }
    });

    app.filter("NumberFilter", function () {
        return function (item, limit) {
            if (item != null && item != undefined && (item + "") != "NaN" && (item + "").trim()) {
                return app.get("$filter")("number")(item, limit);
            }
            return "";
        }
    });
    return app;
});