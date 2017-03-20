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
    var hoursList = constants.getHoursList();
    var minutesList = constants.getMinutesList();
    var secondsList = constants.getSecondsList();

    app.directive("ymdhmsPicker", ["$rootScope", "$timeout", "windowResize",
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
                templateUrl: MyConstants.FILE_URL + "/js/core/directive/datetime-picker/ymdhms-picker.html?vid=" + MyConstants.VERSION,
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

                    $scope.format = "yyyy-MM-dd HH:mm:ss";

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

                            if (fecha.format(oldTime, fecha.YYYYMMDDHHMMSS) != fecha.format(newTime, fecha.YYYYMMDDHHMMSS)) {
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
                        var boxWidth = calendarBox.width();
                        var boxHeight = calendarBox.height();

                        var left = input.offset().left;
                        if ($(input).closest(".modal-content").length > 0) {
                            left -= $(input).closest(".modal-content").offset().left;
                        }

                        var offsetLeft = left + boxWidth + 20 - $(window).width();
                        if (offsetLeft > 0) {
                            left -= offsetLeft;
                        }
                        calendarBox.css("left", left);

                        var offsetTop = $(input).closest(".modal-content").length > 0 ? 30 : 0;
                        var position = input.attr("jya-position");
                        var top = input.offset().top + tools.getTruesHeight(input) - offsetTop + 3;
                        if ($scope.jyaPosition === "top" || input.offset().top + boxHeight + tools.getTruesHeight(input) > $(window).height()) {
                            var top2 = input.offset().top - boxHeight - 8 - offsetTop;
                            if (top2 > 65) {
                                top = top2;
                            }
                        }
                        calendarBox.css("top", top);
                    };

                    windowResize.addHandlerAndDestroy(function () {
                        calendarBoxPosition();
                    });

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


                    var getTempDate = function () {
                        return fecha.parse2($scope.stringValue, formatFechaMapping[$scope.format]);
                    };

                    var estimateDate = function (date) {
                        var hours = date.getHours();
                        var minutes = date.getMinutes();
                        if (date.getTime() < minDate.getTime()) {
                            date.setTime(minDate.getTime());
                        } else if (date.getTime() > maxDate.getTime()) {
                            date.setTime(maxDate.getTime());
                        } else {
                            var re = false;
                            if ($scope.maxDate != null && date.getTime() > $scope.maxDate.getTime()) {
                                date.setTime($scope.maxDate.getTime());
                                re = true;
                            } else if ($scope.minDate != null && date.getTime() < $scope.minDate.getTime()) {
                                date.setTime($scope.minDate.getTime());
                                re = true
                            }
                            if (re) {
                                date.setHours(hours);
                                date.setMinutes(minutes);
                                if ($scope.maxDate != null && date.getTime() > $scope.maxDate.getTime()) {
                                    date.setTime($scope.maxDate.getTime());
                                } else if ($scope.minDate != null && date.getTime() < $scope.minDate.getTime()) {
                                    date.setTime($scope.minDate.getTime());
                                }
                            }
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
                        } else {
                            $scope.stringValue = "";
                            input.val(uiMaskStr);
                        }
                    });

                    $scope.inputKeyup = function () {
                        var text = input.val();
                        angular.forEach(replaceMaskArray, function (maskChar) {
                            text = text.replaceAll(maskChar, "");
                        });

                        var date = null;

                        if (date == null && text.length >= 14) {
                            date = fecha.parse2(text.substring(0, 14), "YYYYMMDDHHmmss");
                        }

                        if (date == null && text.length >= 12) {
                            date = fecha.parse2(text.substring(0, 12), "YYYYMMDDHHmm");
                        }

                        if (date == null && text.length >= 10) {
                            date = fecha.parse2(text.substring(0, 10), "YYYYMMDDHH");
                        }

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
                                tools.timerAlert("最大可选日期为" + fecha.format($scope.maxDate, fecha.YYYYMMDDHHMMSS));
                            }
                        }
                    };

                    $scope.nextYear = function (event) {
                        event && $(event.currentTarget).blur();
                        $scope.viewYear = (parseInt($scope.viewYear) + 1).toString();
                        var before = $scope.viewYear;
                        $scope.viewDateChange();
                        if ($scope.maxDate && before != $scope.viewYear) {
                            tools.timerAlert("最大可选日期为" + fecha.format($scope.maxDate, fecha.YYYYMMDDHHMMSS));
                        }
                    };

                    $scope.lastHours = function () {
                        var hours = parseInt($scope.viewHours);
                        if (hours <= 0) {
                            $scope.viewHours = 23;
                        } else {
                            $scope.viewHours = (hours - 1).toString();
                        }
                        $scope.viewTimeChange();
                    };

                    $scope.nextHours = function () {
                        var hours = parseInt($scope.viewHours);
                        if (hours >= 23) {
                            $scope.viewHours = 0;
                        } else {
                            $scope.viewHours = (hours + 1).toString();
                        }
                        $scope.viewTimeChange();
                    };

                    $scope.lastMinutes = function () {
                        var minutes = parseInt($scope.viewMinutes);
                        if (minutes <= 0) {
                            $scope.lastHours();
                            $scope.viewMinutes = "59";
                        } else {
                            $scope.viewMinutes = (minutes - 1).toString();
                        }
                        $scope.viewTimeChange();
                    };

                    $scope.nextMinutes = function () {
                        var minutes = parseInt($scope.viewMinutes);
                        if (minutes >= 59) {
                            $scope.viewMinutes = "0";
                            $scope.nextHours();
                        } else {
                            $scope.viewMinutes = (minutes + 1).toString();
                        }
                        $scope.viewTimeChange();
                    };

                    $scope.lastSeconds = function () {
                        var seconds = parseInt($scope.viewSeconds);
                        if (seconds <= 0) {
                            $scope.viewSeconds = "59";
                            $scope.lastMinutes();
                        } else {
                            $scope.viewSeconds = (seconds - 1).toString();
                        }
                        $scope.viewTimeChange();
                    };

                    $scope.nextSeconds = function () {
                        var seconds = parseInt($scope.viewSeconds);
                        if (seconds >= 59) {
                            $scope.viewSeconds = "0";
                            $scope.nextMinutes();
                        } else {
                            $scope.viewSeconds = (seconds + 1).toString();
                        }
                        $scope.viewTimeChange();
                    };


                    element.find("[ng-model='viewYear']").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.nextYear()
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
                                $scope.nextMonth()
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.lastMonth();
                            });
                        }
                    });

                    element.find("[ng-model='viewHours']").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.nextHours()
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.lastHours();
                            });
                        }
                    });

                    element.find("[ng-model='viewMinutes']").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.nextMinutes()
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.lastMinutes();
                            });
                        }
                    });

                    element.find("[ng-model='viewSeconds']").mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            $scope.$apply(function () {
                                $scope.nextSeconds()
                            });
                        } else if (event.deltaY < 0) {
                            $scope.$apply(function () {
                                $scope.lastSeconds();
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
                        viewDate.setHours(parseInt($scope.viewHours));
                        viewDate.setMinutes(parseInt($scope.viewMinutes));
                        viewDate.setSeconds(parseInt($scope.viewSeconds));
                        $scope.viewDate = viewDate;
                        $scope.calculateView(viewDate);
                    };

                    $scope.viewTimeChange = function () {
                        $scope.viewDate.setHours(parseInt($scope.viewHours));
                        $scope.viewDate.setMinutes(parseInt($scope.viewMinutes));
                        $scope.viewDate.setSeconds(parseInt($scope.viewSeconds));

                        var date = getTempDate();
                        if (!date) {
                            date = new Date()
                        }
                        date.setHours($scope.viewDate.getHours());
                        date.setMinutes($scope.viewDate.getMinutes());
                        date.setSeconds($scope.viewDate.getSeconds());
                        estimateDate(date);
                        $scope.viewHours = date.getHours().toString();
                        $scope.viewMinutes = date.getMinutes().toString();
                        $scope.viewSeconds = date.getSeconds().toString();
                        $scope.viewDate.setHours(parseInt($scope.viewHours));
                        $scope.viewDate.setMinutes(parseInt($scope.viewMinutes));
                        $scope.viewDate.setSeconds(parseInt($scope.viewSeconds));

                        $scope.stringValue = fecha.format(date, formatFechaMapping[$scope.format]);
                        $scope.rangeDateChange();
                    };
                    $scope.$watch("viewDate", function (viewDate) {
                        $scope.calculateView(viewDate);
                    });

                    var calculateMinDate = null;
                    var calculateMaxDate = null;
                    var calculateYear = null;
                    var calculateMonth = null;
                    var calculateSelectDate = null;

                    var updateSelectState = function () {
                        if (!$scope.weekList) {
                            return;
                        }
                        var selectDate = fecha.format(getTempDate(), fecha.YYYYMMDD);
                        for (var i = 0; i < $scope.weekList.length; i++) {
                            var week = $scope.weekList[i];
                            for (var j = 0; j < week.length; j++) {
                                var dayItem = week[j];
                                dayItem.select = fecha.format(dayItem.date, fecha.YYYYMMDD) == selectDate;
                            }
                        }
                    };

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
                        } else if (calculateSelectDate != fecha.format(getTempDate(), fecha.YYYYMMDD)) {
                            change = true;
                        }

                        updateSelectState();

                        estimateDate(date);

                        $scope.viewYear = date.getFullYear().toString();
                        $scope.viewMonth = (date.getMonth() + 1).toString();
                        $scope.viewHours = date.getHours().toString();
                        $scope.viewMinutes = date.getMinutes().toString();
                        $scope.viewSeconds = date.getSeconds().toString();

                        if (!change) {
                            return;
                        }
                        date = new Date(date.getTime());
                        date.setDate(1);

                        var selectDate = fecha.format(getTempDate(), fecha.YYYYMMDD);
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
                        item.select = true;

                        var date = getTempDate();
                        var hms = "";

                        if (date) {
                            hms = fecha.format(date, fecha.YYYYMMDDHHMMSS).split(" ");
                            hms = hms[1];
                            hms = hms.replace(":", "");
                        } else {
                            date = new Date();
                            if ($scope.viewHours) {
                                date.setHours(parseInt($scope.viewHours));
                            }
                            if ($scope.viewMinutes) {
                                date.setMinutes(parseInt($scope.viewMinutes));
                            }
                            if ($scope.viewSeconds) {
                                date.setSeconds(parseInt($scope.viewSeconds));
                            }

                            hms = fecha.format(date, fecha.YYYYMMDDHHMMSS).split(" ");
                            hms = hms[1];
                            hms = hms.replace(":", "");
                        }

                        $scope.stringValue = fecha.format(item.date, "YYYYMMDD") + hms;
                        $timeout(function () {
                            $scope.viewDate = fecha.parse2($scope.stringValue, "YYYYMMDDHHmmss");
                            setTimeout(function () {
                                input.blur();
                            }, 50);
                        }, 50);
                    };

                    $scope.confirm = function () {
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
                            $scope.hoursList = angular.copy(hoursList);
                            $scope.minutesList = angular.copy(minutesList);
                            $scope.secondsList = angular.copy(secondsList);
                        } else {
                            angular.forEach($scope.yearList, function (item) {
                                item.disabled = false;
                            });
                            angular.forEach($scope.monthList, function (item) {
                                item.disabled = false;
                            });
                            angular.forEach($scope.hoursList, function (item) {
                                item.disabled = false;
                            });
                            angular.forEach($scope.minutesList, function (item) {
                                item.disabled = false;
                            });
                            angular.forEach($scope.secondsList, function (item) {
                                item.disabled = false;
                            });
                        }

                        var minYear = $scope.minDate ? $scope.minDate.getFullYear() : 1900;
                        var maxYear = $scope.maxDate ? $scope.maxDate.getFullYear() : 2099;
                        var minMonth = $scope.minDate ? $scope.minDate.getMonth() + 1 : 1;
                        var maxMonth = $scope.maxDate ? $scope.maxDate.getMonth() + 1 : 12;
                        var minHours = $scope.minDate ? $scope.minDate.getHours() : 0;
                        var maxHours = $scope.maxDate ? $scope.maxDate.getHours() : 23;
                        var minMinutes = $scope.minDate ? $scope.minDate.getMinutes() : 0;
                        var maxMinutes = $scope.maxDate ? $scope.maxDate.getMinutes() : 59;
                        var minSeconds = $scope.minDate ? $scope.minDate.getSeconds() : 0;
                        var maxSeconds = $scope.maxDate ? $scope.maxDate.getSeconds() : 59;

                        angular.forEach($scope.yearList, function (item) {
                            if (item.value < minYear || item.value > maxYear) {
                                item.disabled = true;
                            }
                        });

                        if (($scope.viewYear && parseInt($scope.viewYear) == minYear) || ($scope.viewYear && parseInt($scope.viewYear) == maxYear)) {
                            angular.forEach($scope.monthList, function (item) {
                                if (item.value < minMonth || item.value > maxMonth) {
                                    item.disabled = true;
                                }
                            });
                        }

                        var tempDate = fecha.format(getTempDate(), fecha.YYYYMMDD);
                        if (($scope.minDate && fecha.format($scope.minDate, fecha.YYYYMMDD) == tempDate)
                            || ($scope.maxDate && fecha.format($scope.maxDate, fecha.YYYYMMDD) == tempDate)) {

                            angular.forEach($scope.hoursList, function (item) {
                                if (item.value < minHours || item.value > maxHours) {
                                    item.disabled = true;
                                }
                            });

                            tempDate = fecha.format(getTempDate(), fecha.YYYYMMDDHH);

                            if (($scope.minDate && fecha.format($scope.minDate, fecha.YYYYMMDDHH) == tempDate)
                                || ($scope.maxDate && fecha.format($scope.maxDate, fecha.YYYYMMDDHH) == tempDate)) {

                                angular.forEach($scope.minutesList, function (item) {
                                    if (item.value < minMinutes || item.value > maxMinutes) {
                                        item.disabled = true;
                                    }
                                });

                                tempDate = fecha.format(getTempDate(), fecha.YYYYMMDDHHMM);

                                if (($scope.minDate && fecha.format($scope.minDate, fecha.YYYYMMDDHHMM) == tempDate)
                                    || ($scope.maxDate && fecha.format($scope.maxDate, fecha.YYYYMMDDHHMM) == tempDate)) {

                                    angular.forEach($scope.secondsList, function (item) {
                                        if (item.value < minSeconds || item.value > maxSeconds) {
                                            item.disabled = true;
                                        }
                                    });
                                }
                            }
                        }
                    };
                }
            };
        }
    ]);
});