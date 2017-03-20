"use strict";
define(["main-app"], function (app) {

    app.factory("buttonInterval", ["$interval", "destroy",
        function ($interval, destroy) {

            var callBack = {};

            destroy.factoryAddDestroyListener(function () {
                callBack = {};
            });

            var add = function (id, button, seconds) {
                if (seconds === null || seconds === undefined || seconds === 0) {
                    return;
                }
                if (button) {
                    var oldText = button.html();
                    callBack[id] = function (_seconds) {
                        if (_seconds === 0) {
                            button.html(oldText);
                            button.removeAttr("disabled");
                        } else {
                            button.attr("disabled", "disabled");
                            button.html(oldText + "(" + _seconds + ")");
                        }
                    };
                }

                if (!window.localStorage["allButtonInterval"]) {
                    window.localStorage["allButtonInterval"] = JSON.stringify([id]);
                } else {
                    var allButtonInterval = JSON.parse(window.localStorage["allButtonInterval"]);
                    var exist = false;
                    for (var i = 0; i < allButtonInterval.length; i++) {
                        if (allButtonInterval[i] == id) {
                            exist = true;
                        }
                    }
                    if (!exist) {
                        allButtonInterval.push([id]);
                        window.localStorage["allButtonInterval"] = JSON.stringify(allButtonInterval);
                    }
                }
                window.localStorage["buttonIntervalTotal" + id] = seconds;
                window.localStorage["buttonIntervalTime" + id] = parseInt(new Date().getTime() / 1000);
                start();
            };

            var refresh = function (id, button) {
                if (button) {
                    var oldText = button.html();
                    callBack[id] = function (_seconds) {
                        if (_seconds === 0) {
                            button.html(oldText);
                            button.removeAttr("disabled");
                        } else {
                            button.attr("disabled", "disabled");
                            button.html(oldText + "(" + _seconds + ")");
                        }
                    };
                }
                start();
            };

            var intervalTimer = null;
            var startFlag = false;
            var start = function () {
                if (startFlag || !window.localStorage["allButtonInterval"]) {
                    return;
                }
                startFlag = true;
                var count = function () {
                    var allButtonInterval = JSON.parse(window.localStorage["allButtonInterval"]);
                    var runningFlag = false;
                    angular.forEach(allButtonInterval, function (id) {
                        var total = window.localStorage["buttonIntervalTotal" + id];
                        var time = window.localStorage["buttonIntervalTime" + id];
                        if (time !== null && time !== undefined) {
                            var surplus = total - parseInt((new Date().getTime() / 1000 - time));
                            if (surplus > total || surplus <= 0) {
                                surplus = 0;
                                delete window.localStorage["buttonIntervalTotal" + id];
                                delete window.localStorage["buttonIntervalTime" + id];
                            }
                            callBack[id] && callBack[id](surplus);
                            runningFlag = true;
                        }
                    });
                    if (!runningFlag) {
                        $interval.cancel(intervalTimer);
                        startFlag = false;
                    }
                };
                intervalTimer = $interval(count, 1010);
                count();
            };

            return {
                add: add,//查询数据使用
                refresh: refresh,
                start: start
            };
        }
    ]);
});