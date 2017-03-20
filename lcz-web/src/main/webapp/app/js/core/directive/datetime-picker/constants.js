"use strict";
define(["angular", "core/factory/fecha", "jquery-mousewheel"], function (angular, fecha) {

    var formatUIMaskMapping = {
        "yyyy-MM-dd": "9999-99-99",
        "yyyy-MM-dd HH:mm:ss": "9999-99-99 99:99:99"
    };

    var formatFechaMapping = {
        "yyyy-MM-dd": "YYYYMMDD",
        "yyyy-MM-dd HH:mm:ss": "YYYYMMDDHHmmss"
    };

    var formatFechaMapping2 = {
        "yyyy-MM-dd": "YYYY-MM-DD",
        "yyyy-MM-dd HH:mm:ss": "YYYY-MM-DD HH:mm:ss"
    };

    var formatWidthMapping = {
        "yyyy-MM-dd": 120,
        "yyyy-MM-dd HH:mm:ss": 180
    };
    var i;
    var yearList = [];
    for (i = 1900; i <= 2099; i++) {
        yearList.push({disabled: false, value: i});
    }
    var monthList = [];
    for (i = 1; i <= 12; i++) {
        monthList.push({disabled: false, value: i});
    }
    var hoursList = [];
    for (i = 0; i <= 23; i++) {
        hoursList.push({disabled: false, value: i});
    }
    var minutesList = [];
    for (i = 0; i <= 59; i++) {
        minutesList.push({disabled: false, value: i});
    }
    var secondsList = [];
    for (i = 0; i <= 59; i++) {
        secondsList.push({disabled: false, value: i});
    }

    var replaceMaskArray = ["年", "月", "日", "时", "分", "秒", ":", " ", "_", "-"];

    var minDate = fecha.parse("1900-01-01 00:00:00:000", fecha.YYYYMMDDHHMMSSSSS);

    var maxDate = fecha.parse("2099-12-31 23:59:59:999", fecha.YYYYMMDDHHMMSSSSS);

    return {
        formatUIMaskMapping: formatUIMaskMapping,
        formatFechaMapping: formatFechaMapping,
        formatFechaMapping2: formatFechaMapping2,
        formatWidthMapping: formatWidthMapping,
        getYearList: function () {
            return angular.copy(yearList);
        },
        getMonthList: function () {
            return angular.copy(monthList);
        },
        getHoursList: function () {
            return angular.copy(hoursList);
        },
        getMinutesList: function () {
            return angular.copy(minutesList);
        },
        getSecondsList: function () {
            return angular.copy(secondsList);
        },
        replaceMaskArray: replaceMaskArray,
        minDate: minDate,
        maxDate: maxDate
    };
});