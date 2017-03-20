/**
 * 年月日 控件
 */
"use strict";
define(["main-app", "jquery", "tools", "core/directive/datetime-picker/constants", "core/factory/fecha"], function (app, $, tools, constants, fecha) {

    var formatUIMaskMapping = constants.formatUIMaskMapping;
    var formatFechaMapping = constants.formatFechaMapping;
    var formatFechaMapping2 = constants.formatFechaMapping2;
    var formatWidthMapping = constants.formatWidthMapping;
    var replaceMaskArray = constants.replaceMaskArray;
    var minDate = constants.minDate;
    var maxDate = constants.maxDate;
    var yearList = constants.getYearList();
    var monthList = constants.getMonthList();

    app.directive("ymdPicker", ["$rootScope", "$timeout", "windowResize",
        function ($rootScope, $timeout, windowResize) {
            return {
                scope: {
                    jyId: "=?", //模块的id
                    jyMinDate: "=?",//限制开始日期
                    jyMaxDate: "=?",//限制结束日期
                    jyDisabled: "=?",//只读
                    jyaIsDate: "@",//是不是date类型 默认为true  true:jyId绑定scope对象是date类型 false:绑定的值是字符串类型
                    jyRequired: "=?",//是否非空，默认false,也可以写自定义的验证
                    jyaName: "@",//用于验证
                    jyaPosition: "@",//视图显示的位置 top bottom
                    jyfChange: "&",//日期变化回调函数
                    jyChangeParam: "=?",//回调参数1
                    jyaChangeParamIndex: "@"//回调参数2
                },
                restrict: "E",
                templateUrl: MyConstants.FILE_URL + "/js/core/directive/datetime-picker/ymd-picker.html?vid=" + MyConstants.VERSION,
                replace: true,
                link: function postLink($scope, element, attributes) {
                    $scope.isDate = $scope.jyaIsDate !== "false";

                    var input = element.find("input");
                    input.keydown(function (event) {
                        if (event.keyCode == 13) {
                            $scope.$apply(function () {
                                viewHide(false);
                            });
                        }
                    });

                    $scope.format = "yyyy-MM-dd";

                    element.css("width", formatWidthMapping[$scope.format]);
                    input.css("width", formatWidthMapping[$scope.format]);

                    $scope.uiMask = formatUIMaskMapping[$scope.format];

                    var uiMaskStr = $scope.uiMask.replaceAll("9", "_");

                    var calendarBox = element.find(".calendar-box");
                    $scope.showCalendarBox = false;

                    $scope.eventId = Math.random().toString().replace(".", "");
                    element.addClass("datetime-picker" + $scope.eventId);

                    var viewHide = function (apply) {
                        input.removeClass("input-focus");
                        $(document).off("click.datetime-picker" + $scope.eventId);

                        var applyHandler = function () {
                            setTimeout(function () {
                                input.attr("jyv-blur-flag", "true");
                                input.blur();
                                input.attr("jyv-blur-flag", "false");
                            }, 300);
                            $scope.showCalendarBox = false;
                            if (!$scope.stringValue) {
                                input.val(uiMaskStr);
                                $scope.jyId = null;
                                return;
                            }
                            var date = fecha.parse2($scope.stringValue, formatFechaMapping[$scope.format]);
                            if (date == null) {
                                input.val(uiMaskStr);
                                $scope.jyId = null;
                                return;
                            }
                            estimateDate(date);

                            $scope.stringValue = fecha.format(date, formatFechaMapping[$scope.format]);

                            var oldTime = getDate($scope.jyId);
                            if (oldTime) oldTime = oldTime.getTime();
                            var newTime = $scope.stringValue;
                            if (newTime) newTime = fecha.parse(newTime, formatFechaMapping[$scope.format]).getTime();

                            if (fecha.format(oldTime, fecha.YYYYMMDD) != fecha.format(newTime, fecha.YYYYMMDD)) {
                                $scope.jyId = $scope.isDate ? fecha.parse($scope.stringValue, formatFechaMapping[$scope.format]) : fecha.format(new Date(newTime), formatFechaMapping2[$scope.format]);
                                var timer = $timeout(function () {
                                    $timeout.cancel(timer);
                                    $scope.jyfChange && $scope.jyfChange({
                                        param: $scope.jyChangeParam,
                                        index: $scope.jyaChangeParamIndex
                                    });
                                }, 100);
                            }
                        };
                        if (apply) {
                            $scope.$apply(applyHandler);
                        } else {
                            applyHandler();
                        }
                    };

                    var calendarBoxPosition = function () {
                        tools.inputBoxPosition(calendarBox, input, $scope.jyaPosition);
                    };

                    windowResize.addHandlerAndDestroy(calendarBoxPosition);

                    $scope.$on("focusUniqueView", function (event, eventId) {
                        if ($scope.showCalendarBox && $scope.eventId != eventId) {
                            viewHide(false);
                        }
                    });
                    $scope.inputFocus = function () {
                        if ($scope.showCalendarBox || $scope.jyDisabled) {
                            return;
                        }
                        $rootScope.$broadcast("focusUniqueView", $scope.eventId);
                        input.addClass("input-focus");

                        $(document).on("click.datetime-picker" + $scope.eventId, function (event) {
                            if (!($(event.target).closest("[jya-eventId='" + $scope.eventId + "']").length > 0) && !($(event.target).closest(".datetime-picker" + $scope.eventId).length > 0)) {
                                viewHide(true);
                            }
                        });

                        $scope.showCalendarBox = true;
                        $scope.viewDate = getDate($scope.jyId);
                        if ($scope.viewDate == null) {
                            $scope.viewDate = new Date();
                        }
                        calendarBox.css("opacity", 0);
                        $timeout(function () {
                            calendarBox.css("opacity", 1);
                            calendarBoxPosition();
                        }, 100);
                    };

                    $scope.iconClick = function () {
                        if ($scope.jyDisabled) {
                            return;
                        }
                        $scope.inputFocus();
                    };

                    var getDate = function (date) {
                        if (!date && date !== 0) {
                            return null;
                        }
                        if (angular.isDate(date)) {
                            return new Date(date.getTime());
                        } else if (angular.isNumber(date)) {
                            return new Date(date);
                        } else if (angular.isString(date)) {
                            return fecha.parse(date, formatFechaMapping2[$scope.format]);
                        }
                    };

                    var estimateDate = function (date) {
                        if (date.getTime() < minDate.getTime()) {
                            date.setTime(minDate.getTime());
                        } else if (date.getTime() > maxDate.getTime()) {
                            date.setTime(maxDate.getTime());
                        } else if ($scope.maxDate != null && date.getTime() > $scope.maxDate.getTime()) {
                            date.setTime($scope.maxDate.getTime());
                        } else if ($scope.minDate != null && date.getTime() < $scope.minDate.getTime()) {
                            date.setTime($scope.minDate.getTime());
                        }
                    };

                    $scope.$watch("jyId", function (jyId) {
                        if (jyId || jyId === 0) {
                            if ($scope.isDate) {
                                if (angular.isNumber(jyId)) {
                                    $scope.jyId = new Date(jyId);
                                    return;
                                }
                            } else {
                                if (angular.isDate(jyId)) {
                                    $scope.jyId = fecha.format($scope.jyId, formatFechaMapping2[$scope.format]);
                                    return;
                                } else if (angular.isNumber(jyId)) {
                                    $scope.jyId = fecha.format(new Date($scope.jyId), formatFechaMapping2[$scope.format]);
                                    return;
                                }
                            }
                        }
                        var date = getDate($scope.jyId);
                        if (date != null) {
                            $scope.stringValue = fecha.format(date, formatFechaMapping[$scope.format]);
                            $scope.viewDate = getDate($scope.jyId);
                        } else {
                            $scope.stringValue = "";
                            $scope.viewDate = new Date();
                            input.val(uiMaskStr);
                        }
                    });

                    $scope.inputKeyup = function () {
                        var text = input.val();
                        angular.forEach(replaceMaskArray, function (maskChar) {
                            text = text.replaceAll(maskChar, "");
                        });

                        var date = null;

                        if (date == null && text.length >= 8) {
                            date = fecha.parse2(text.substring(0, 8), "YYYYMMDD");
                        }

                        if (date == null && text.length >= 6) {
                            date = fecha.parse2(text.substring(0, 6) + "01", "YYYYMMDD");
                        }

                        if (date == null && text.length >= 4) {
                            date = fecha.parse2(text.substring(0, 4) + "0101", "YYYYMMDD");
                        }
                        $scope.viewDate = date != null ? date : new Date();
                    };

                    $scope.lastYear = function (event) {
                        event && $(event.currentTarget).blur();
                        $scope.viewYear = (parseInt($scope.viewYear) - 1).toString();
                        var before = $scope.viewYear;
                        $scope.viewDateChange();
                        if ($scope.minDate && before != $scope.viewYear) {
                            tools.timerAlert("最小可选日期为" + fecha.format($scope.minDate, fecha.YYYYMMDD));
                        }
                    };

                    $scope.lastMonth = function (event) {
                        event && $(event.currentTarget).blur();
                        $scope.viewMonth = (parseInt($scope.viewMonth) - 1).toString();
                        var before = $scope.viewMonth;
                        if ($scope.viewMonth === "0") {
                            $scope.viewMonth = "12";
                            $scope.lastYear();
                        } else {
                            $scope.viewDateChange();
                            if (before != $scope.viewMonth) {
                                tools.timerAlert("最小可选日期为" + fecha.format($scope.minDate, fecha.YYYYMMDD));
                            }
                        }
                    };

                    $scope.nextMonth = function (event) {
                        event && $(event.currentTarget).blur();
                        $scope.viewMonth = (parseInt($scope.viewMonth) + 1).toString();
                        var before = $scope.viewMonth;
                        if ($scope.viewMonth === "13") {
                            $scope.viewMonth = "1";
                            $scope.nextYear();
                        } else {
                            $scope.viewDateChange();
                            if (before != $scope.viewMonth) {
                                tools.timerAlert("最大可选日期为" + fecha.format($scope.maxDate, fecha.YYYYMMDD));
                            }
                        }
                    };

                    $scope.nextYear = function (event) {
                        event && $(event.currentTarget).blur();
                        $scope.viewYear = (parseInt($scope.viewYear) + 1).toString();
                        var before = $scope.viewYear;
                        $scope.viewDateChange();
                        if ($scope.maxDate && before != $scope.viewYear) {
                            tools.timerAlert("最大可选日期为" + fecha.format($scope.maxDate, fecha.YYYYMMDD));
                        }
                    };

                    element.find("[ng-model='viewYear']").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.nextYear();
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.lastYear();
                            });
                        }
                    });

                    element.find("[ng-model='viewMonth']").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.nextMonth();
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.lastMonth();
                            });
                        }
                    });


                    element.find("table").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.lastMonth();
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.nextMonth()
                            });
                        }
                    });

                    $scope.viewDateChange = function () {
                        var viewDate = new Date();
                        viewDate.setDate(1);
                        viewDate.setFullYear(parseInt($scope.viewYear));
                        viewDate.setMonth(parseInt($scope.viewMonth) - 1);
                        $scope.viewDate = viewDate;
                        $scope.calculateView(viewDate);
                    };

                    $scope.$watch("viewDate", function (viewDate) {
                        $scope.calculateView(viewDate);
                    });

                    var calculateMinDate = null;
                    var calculateMaxDate = null;
                    var calculateYear = null;
                    var calculateMonth = null;
                    var calculateSelectDate = null;

                    $scope.calculateView = function (date) {
                        if (!$scope.showCalendarBox) {
                            return;
                        }
                        if (!date) {
                            date = new Date();
                        }

                        var change = false;
                        if (($scope.minDate == null && calculateMinDate != null) || ($scope.minDate != null && calculateMinDate == null)) {
                            change = true;
                        } else if ($scope.minDate != null && calculateMinDate != null && $scope.minDate.getTime() != calculateMinDate.getTime()) {
                            change = true;
                        } else if (($scope.maxDate == null && calculateMaxDate != null) || ($scope.maxDate != null && calculateMaxDate == null)) {
                            change = true;
                        } else if ($scope.maxDate != null && calculateMaxDate != null && $scope.maxDate.getTime() != calculateMaxDate.getTime()) {
                            change = true;
                        } else if (calculateYear != date.getFullYear().toString()) {
                            change = true;
                        } else if (calculateMonth != (date.getMonth() + 1).toString()) {
                            change = true;
                        } else if (calculateSelectDate != fecha.format(getDate($scope.jyId), fecha.YYYYMMDD)) {
                            change = true;
                        }

                        estimateDate(date);

                        $scope.viewYear = date.getFullYear().toString();
                        $scope.viewMonth = (date.getMonth() + 1).toString();

                        if (!change) {
                            return;
                        }
                        date = new Date(date.getTime());
                        date.setDate(1);
                        var selectDate = fecha.format(getDate($scope.jyId), fecha.YYYYMMDD);
                        var todayDate = fecha.format(new Date(), fecha.YYYYMMDD);

                        var maxDays = tools.maxDays(date);
                        var firstDay = date.getDay();
                        if (firstDay === 0) {
                            firstDay = 7;
                        }

                        $scope.weekList = [];

                        var day = 1;
                        var week = [];
                        for (var i = 0; day <= maxDays || i % 7 !== 0; i++) {
                            if (i !== 0 && i % 7 === 0) {
                                $scope.weekList.push(week);
                                week = [];
                            }
                            var currentDate;
                            var current = false;

                            if (i + 1 < firstDay) {//上个月的
                                var lastDate = new Date(date.getTime());
                                lastDate.setDate(1);
                                lastDate.setTime(lastDate.getTime() - (firstDay - i - 1) * 1000 * 60 * 60 * 24);
                                currentDate = lastDate;
                            } else {
                                if (day <= maxDays) {//当前月的
                                    date.setDate(day);
                                    current = true;
                                    day++;
                                } else {//下个月的
                                    date.setTime(date.getTime() + 1000 * 60 * 60 * 24);
                                }
                                currentDate = date;
                            }

                            var currentDateString = fecha.format(currentDate, fecha.YYYYMMDD);
                            var today = todayDate == currentDateString;
                            var select = selectDate == currentDateString;
                            var disabled = false;
                            if ($scope.minDate && fecha.format(currentDate, fecha.YYYYMMDD) < fecha.format($scope.minDate, fecha.YYYYMMDD)) {
                                disabled = true;
                            } else if ($scope.maxDate && fecha.format(currentDate, fecha.YYYYMMDD) > fecha.format($scope.maxDate, fecha.YYYYMMDD)) {
                                disabled = true;
                            }
                            week.push({
                                day: currentDate.getDate(),
                                date: new Date(currentDate.getTime()),
                                current: today ? true : current,
                                today: today,
                                select: select,
                                disabled: disabled
                            });
                        }
                        $scope.weekList.push(week);

                        calculateMinDate = $scope.minDate;
                        calculateMaxDate = $scope.maxDate;
                        calculateSelectDate = selectDate;
                        calculateYear = $scope.viewYear;
                        calculateMonth = $scope.viewMonth;

                        setTimeout(function () {
                            calendarBoxPosition();
                        }, 100);

                        $scope.rangeDateChange();
                    };

                    $scope.selectDate = function (item) {
                        if (item.disabled) {
                            return;
                        }
                        $scope.stringValue = fecha.format(item.date, formatFechaMapping[$scope.format]);
                        viewHide(false);
                    };

                    $scope.today = function () {
                        var date = new Date();
                        var today1 = fecha.format(date, fecha.YYYYMMDD);
                        estimateDate(date);
                        var today2 = fecha.format(date, fecha.YYYYMMDD);
                        if (today1 != today2) {
                            tools.timerAlert("可选日期被限制，请选择可选择范围内日期！");
                            return;
                        }
                        $scope.stringValue = fecha.format(new Date(), formatFechaMapping[$scope.format]);
                        viewHide(false);
                    };

                    $scope.clear = function () {
                        $scope.stringValue = null;
                        viewHide(false);
                    };

                    $scope.$watch("jyMinDate", function (jyMinDate) {
                        $scope.minDate = getDate(jyMinDate);
                        $scope.calculateView($scope.viewDate);
                    });

                    $scope.$watch("jyMaxDate", function (jyMaxDate) {
                        $scope.maxDate = getDate(jyMaxDate);
                        $scope.calculateView($scope.viewDate);
                    });

                    $scope.rangeDateChange = function () {
                        if ($scope.yearList == null) {
                            $scope.yearList = angular.copy(yearList);
                            $scope.monthList = angular.copy(monthList);
                        } else {
                            angular.forEach($scope.yearList, function (item) {
                                item.disabled = false;
                            });
                            angular.forEach($scope.monthList, function (item) {
                                item.disabled = false;
                            });
                        }

                        var minYear = $scope.minDate ? $scope.minDate.getFullYear() : 1900;
                        var maxYear = $scope.maxDate ? $scope.maxDate.getFullYear() : 2099;
                        var minMonth = $scope.minDate ? $scope.minDate.getMonth() + 1 : 1;
                        var maxMonth = $scope.maxDate ? $scope.maxDate.getMonth() + 1 : 12;

                        angular.forEach($scope.yearList, function (item) {
                            item.disabled = item.value < minYear || item.value > maxYear;
                        });

                        if (($scope.viewYear && parseInt($scope.viewYear) == minYear) || ($scope.viewYear && parseInt($scope.viewYear) == maxYear)) {
                            angular.forEach($scope.monthList, function (item) {
                                item.disabled = item.value < minMonth || item.value > maxMonth;
                            });
                        }
                    };
                }
            };
        }
    ]);
});