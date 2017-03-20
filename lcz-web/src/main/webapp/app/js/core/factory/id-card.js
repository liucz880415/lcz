"use strict";
define(["main-app", "main-data", "jquery", "tools"], function (app, navData, $, tools) {
    app.factory("idCard", ["fecha", function (fecha) {
        var isDate6 = function (sDate) {
            if (!/^[0-9]{6}$/.test(sDate)) {
                return false;
            }
            var year, month, day;
            year = "19" + sDate.substring(0, 2);
            month = sDate.substring(2, 4);
            day = sDate.substring(4, 6);
            if (year < 1700 || year > 2500) return false;
            if (month < 1 || month > 12) return false;
            var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return !(day < 1 || day > iaMonthDays[month - 1]);
        };

        var isDate8 = function (sDate) {
            if (!/^[0-9]{8}$/.test(sDate)) {
                return false;
            }
            var year, month, day;
            year = sDate.substring(0, 4);
            month = sDate.substring(4, 6);
            day = sDate.substring(6, 8);
            var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (year < 1700 || year > 2500) return false;
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) iaMonthDays[1] = 29;
            if (month < 1 || month > 12) return false;
            return !(day < 1 || day > iaMonthDays[month - 1]);
        };

        var validate = function (value) {
            if (value != null && value != "" && value != undefined) {
                value = value.toUpperCase();
            }
            var factorArr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
            var parityBit = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
            var varArray = [];
            var lngProduct = 0;
            var intCheckDigit;
            var intStrLen = value.length;
            var numberValue = value;
            if ((intStrLen != 15) && (intStrLen != 18)) {
                return false;
            }
            for (var i = 0; i < intStrLen; i++) {
                varArray[i] = numberValue.charAt(i);
                if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
                    return false;
                } else if (i < 17) {
                    varArray[i] = varArray[i] * factorArr[i];
                }
            }

            if (intStrLen == 18) {
                var date8 = numberValue.substring(6, 14);
                if (isDate8(date8) == false) {
                    return false;
                }
                for (i = 0; i < 17; i++) {
                    lngProduct = lngProduct + varArray[i];
                }
                intCheckDigit = parityBit[lngProduct % 11];
                if (varArray[17] != intCheckDigit) {
                    return false;
                }
            } else {
                var date6 = numberValue.substring(6, 12);
                if (isDate6(date6) == false) {
                    return false;
                }
            }
            return true;
        };

        var getBirthday = function (value) {
            if (!value) {
                return;
            }
            value = value + "";
            if (value.length === 15) {
                return fecha.parse("19" + value.substring(6, 12), "YYYYMMDD");
            } else if (value.length === 18) {
                return fecha.parse(value.substring(6, 14), "YYYYMMDD");
            }
        };

        var getGender = function (value) {
            if (!value) {
                return;
            }
            value = value + "";
            if (value.length == 15) {
                return value.charAt(value.length - 1) % 2 == 0 ? "FEMALE" : "MALE";
            }
            if (value.length == 18) {
                return value.charAt(value.length - 2) % 2 == 0 ? "FEMALE" : "MALE";
            }
            return "MALE";
        };
        return {
            validate: validate,
            getBirthday: getBirthday,
            getGender: getGender
        }
    }]);
});