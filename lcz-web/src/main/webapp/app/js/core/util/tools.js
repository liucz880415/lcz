"use strict";
define(["jquery"], function ($) {
    var $window = $(window);
    var $body = $("body");

    var alertTemplate = "<div class='tip-box' style='display:none;'>" +
        "<div class='tip-box-title'><span class='icon-warning-sign'></span> 提示</div>" +
        "<div class='tip-box-text'>$(text)</div>" +
        "</div>";

    var timerAlertTemplate = "<div class='tip-box' style='display:none;top: 10%;'>" +
        "<div class='tip-box-title'><span class='icon-warning-sign'></span> 提示</div>" +
        "<div class='tip-box-nobutton-text'>$(text)</div>" +
        "</div>";

    var alertDefaultButton = function (text, confirmB, cancelB, close) {
        var buttons = {};
        if (confirmB != null) {
            if (cancelB != null) {
                buttons["确认"] = confirmB;
                buttons["取消"] = cancelB;
            } else {
                buttons["知道了"] = confirmB;
            }
        }
        alertCustomButton(text, buttons, close);
    };

    var delayButton = function (button, delay) {
        if (!delay) {
            return;
        }
        var buttonHtml = button.html();
        button.attr("disabled", "disabled");
        button.css("cursor", "wait");
        button.css("border-radius", "4px");
        button.addClass("btn");

        button.html(buttonHtml + "（" + delay + "）");
        var timer = setInterval(function () {
            if (--delay == 0) {
                button.removeAttr("disabled");
                button.css("cursor", "pointer");
                button.html(buttonHtml);
                clearInterval(timer);
            } else {
                button.html(buttonHtml + "（" + delay + "）");
            }
        }, 1000);
    };

    var alertCustomButton = function (text, buttons, closeH, delay) {
        var mask = $("<div class='modal' style='z-index: 999998;'></div>");
        $body.prepend(mask);

        var div = $(alertTemplate.replace("$(text)", text));
        $body.prepend(div);
        if (buttons == null) {
            buttons = {};
            buttons["知道了"] = function () {
            };
        }
        var buttonLength = 0;
        for (var label in buttons) {
            buttonLength++;
        }
        if (buttonLength > 3) {
            alert("提示框最多支持3个按钮");
            return;
        }

        var close = function () {
            mask.remove();
            div.hide(200, function () {
                div.remove();
                if (closeH != null) {
                    closeH();
                }
            });
        };

        var $buttonBox = $("<div class='tip-box-buttons'></div>")
        var buttonIndex = 0;
        for (var label in buttons) {
            buttonIndex++;
            var buttonDiv = $("<div class='tip-box-buttondds-" + buttonLength + "-" + buttonIndex + "'></div>");
            var button = $("<button class='tip-box-button-" + buttonLength + "-" + buttonIndex + "'>" + label + "</button>");
            button.click(function () {
                var closeValue = buttons[$(this).text()].call(this, div, close);
                if (closeValue == null || closeValue == true) {
                    close();
                }
            });
            delayButton(button, delay);
            buttonDiv.append(button);
            $buttonBox.append(buttonDiv);
        }
        div.append($buttonBox);
        mask.show();
        div.show(200);
        div.find(":button:first").focus();
        return {
            close: close
        };
    };

    var alert = function (text, p1, p2, p3) {
        if ($.isFunction(p1)) {
            alertDefaultButton(text, p1, p2, p3);
        } else {
            alertCustomButton(text, p1, p2);
        }
    };

    var delayAlert = function (text, delay, confirmA, close) {
        var buttons = {};
        buttons["知道了"] = confirmA ? confirmA : function () {
        };
        alertCustomButton(text, buttons, close, delay);
    };


    var timerAlertList = [];

    var timerAlert = function (text, timer, close) {
        for (var i = 0; i < timerAlertList.length; i++) {
            try {
                if (timerAlertList[i].find(".tip-box-nobutton-text").html() === text) {
                    return;
                }
            } catch (e) {

            }
        }

        if (timer == null) timer = 2000;
        var div = $(timerAlertTemplate.replace("$(text)", text));
        $body.prepend(div);
        div.show(200);
        timerAlertList.push(div);
        var d = setTimeout(function () {
            clearTimeout(d);
            div.hide(200, function () {
                timerAlertList.splice(timerAlertList.indexOf(div), 1);
                div.remove();
                if (close != null) {
                    close();
                }
            });
        }, timer);
    };

    var _beforeUnloadHandler;
    var addPageChangeHandler = function (handler) {
        _beforeUnloadHandler = handler;
    };

    var pageChangeHandler = function () {
        if (_beforeUnloadHandler != null) {
            if (_beforeUnloadHandler()) {
                return "有未保存的数据，是否离开？";
            }
        }
        return undefined;
    };

    $window.bind('beforeunload', function () {
        return pageChangeHandler();
    });

    var destroy = function () {
        _beforeUnloadHandler = null;
        $(document).off("click.department-tree-multiple");
    };

    var getIntValue = function (value, defaultValue) {
        if (!defaultValue) {
            defaultValue = "";
        }
        try {
            value = parseInt(value);
            if ((value + "") == "NaN" || value == undefined) {
                return defaultValue;
            } else {
                return value + "";
            }
        } catch (e) {
            return defaultValue;
        }
    };

    var getInt = function (value, defaultValue) {
        if (!defaultValue && defaultValue !== 0) {
            defaultValue = 0;
        }
        try {
            value = parseInt(value);
            if ((value + "") == "NaN" || value == undefined) {
                return defaultValue;
            } else {
                return value;
            }
        } catch (e) {
            return defaultValue;
        }
    };

    var getFloatValue = function (value, defaultValue) {
        if (!defaultValue) {
            defaultValue = "";
        }
        try {
            value = parseFloat(value);
            if ((value + "") == "NaN" || value == undefined) {
                return defaultValue;
            } else {
                return value + "";
            }
        } catch (e) {
            return defaultValue;
        }
    };


    var getFloat = function (value, defaultValue) {
        if (!defaultValue && defaultValue !== 0) {
            defaultValue = 0;
        }
        try {
            value = parseFloat(value);
            if ((value + "") == "NaN" || value == undefined) {
                return defaultValue;
            } else {
                return value;
            }
        } catch (e) {
            return defaultValue;
        }
    };

    var getUrlParams = function (params) {
        var urlParam = angular.copy(params);
        for (var key in urlParam) {
            if (urlParam[key] === true) {
                urlParam[key] = "true";
            } else if (urlParam[key] === false) {
                urlParam[key] = "false";
            }
        }
        return urlParam;
    };

    var getFilePostfix = function (fileName) {
        var postfix = "";
        if (fileName != null && fileName.indexOf(".") > -1) {
            var postfixArray = fileName.split(".");
            postfix = postfixArray[postfixArray.length - 1];
        }
        return postfix;
    };

    (function () {
        //获取文字所占宽度方法
        var widthSpan = $("<span></span>");
        widthSpan.css("visibility", "hidden");
        widthSpan.css("whiteSpace", "nowrap");
        $(document.body).append(widthSpan);

        String.prototype.getWidth = function (fontSize) {
            widthSpan.html(this);
            widthSpan.css("fontSize", fontSize);
            return widthSpan.get(0).offsetWidth;
        };

        String.prototype.getMaxWidthLimit = function (fontSize, maxWidth) {
            var value = this;
            var limit = value.length;
            while (value && value.getWidth(fontSize) > maxWidth) {
                limit--;
                value = value.substring(0, limit);
            }
            return limit;
        };

        //选中文本
        $.fn.setSelectionRange = function (beginIndex, endIndex) {
            return this.each(function () {
                var element = this;
                var $element = $(this);
                var value = $element.val();

                if (!$element.is('input,textarea')) return;
                if (value.length < beginIndex) return;

                setTimeout(function () {
                    $element.focus();
                    if (element.setSelectionRange) {
                        element.setSelectionRange(beginIndex, endIndex)
                    } else if (element.createTextRange) {
                        var range = element.createTextRange();
                        range.moveStart("character", -value.length);
                        range.moveEnd("character", -value.length);
                        range.moveStart("character", beginIndex);
                        range.moveEnd("character", endIndex);
                        range.select();
                    }
                }, 10)
            })
        };
    })();

    var isBlank = function (value) {
        return value === "" || value === null || value === undefined;
    };

    var isNotBlank = function (value) {
        return !isBlank(value);
    };

    var each = function (array, callBack) {
        if (!array || !callBack) {
            return;
        }
        for (var i = 0; i < array.length; i++) {
            if (callBack(array[i], i) === false) {
                break;
            }
        }
    };

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var mutationParams = {attributes: true, childList: true, subtree: true};
    var listenerDOM = function (target, callBack) {

        var runCount = 0;
        setInterval(function () {
            runCount = 0;
        }, 1000);

        var mutationObserver;
        if (MutationObserver) {
            mutationObserver = new MutationObserver(function (a1, a2) {
                var trChangeFlag = false;
                for (var i = 0; i < a1.length; i++) {
                    var item = a1[i];
                    if (item && item.target && item.target.nodeName && (
                        item.target.nodeName.toLocaleUpperCase() == "TR" ||
                        item.target.nodeName.toLocaleUpperCase() == "TH" ||
                        item.target.nodeName.toLocaleUpperCase() == "TD"
                        )) {
                        trChangeFlag = true;
                        break;
                    }
                }
                if (!trChangeFlag) {
                    return;
                }
                if (++runCount > 5) {
                    return;
                }
                callBack();
            });
            mutationObserver.observe(target, mutationParams);
        } else {
            var timer = setInterval(function () {
                callBack();
            }, 5000);
        }
        return {
            destroy: function () {
                if (mutationObserver) {
                    mutationObserver.disconnect();
                    mutationObserver = null;
                } else if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
        }
    };

    var getParent = function ($target, tag) {
        if ($target == null || $target.length == 0) {
            return null;
        }
        if ($target.parent().is(tag)) {
            return $target.parent();
        }
        return getParent($target.parent(), tag);
    };


    var positionInput = function (input, element) {
        element = element.parent();
        if (element == null || element.length == 0) {
            return;
        }
        var overflowY = element.css("overflow-y");
        if (overflowY !== "auto" && overflowY !== "show" && overflowY !== "overlay") {
            positionInput(input, element);
            return;
        }
        var positionTop = input.offset().top - element.offset().top - element.scrollTop();
        if (positionTop < 0) {
            element.scrollTop(element.scrollTop() + positionTop);
        } else if (positionTop + input.height() > element.height()) {
            element.scrollTop(element.scrollTop() + (positionTop + input.height() - element.height()));
        }
        input.focus();
    };

    var getString = function (value) {
        if (isBlank(value)) {
            return "";
        }
        return value + "";
    };

    var getMultipleValue = function (value, number) {
        var returnValue = "";
        for (var i = 0; i < number; i++) {
            returnValue += value
        }
        return returnValue;
    };

    var randomMap = {};

    var getRandomId = function () {
        var randomId = Math.random().toString().replace(".", "");
        if (randomMap[randomId]) {
            return getRandomId();
        }
        randomMap[randomId] = true;
        return randomId;
    };

    var maxDays = function (date) {
        if (!date) date = new Date();
        var maxDays = new Date(date.getTime());
        maxDays.setMonth(maxDays.getMonth() + 1);
        maxDays.setDate(1);
        maxDays.setTime(maxDays.getTime() - 1000 * 60 * 60 * 24);
        return maxDays.getDate();
    };

    var getMaxDayStr = function (date) {
        var day = maxDays(date);
        if (date < 10) {
            return "0" + day;
        }
        return "" + day;
    };

    var isWeekend = function (date) {
        date = new Date(date);
        return date.getDay() === 0 || date.getDay() === 6;
    };

    var getPxNumber = function (value) {
        if (!value) {
            return 0;
        }
        return parseFloat(value.replace("px", ""))
    };

    var getTruesHeight = function ($component) {
        return $component.height() + getPxNumber($component.css("padding-top")) + getPxNumber($component.css("padding-bottom"));
    };


    var inputBoxPosition = function (box, input, position) {
        var boxWidth = box.width();
        var boxHeight = box.height();

        var left = input.offset().left;
        if (input.closest(".modal-content").length > 0) {
            left -= input.closest(".modal-content").offset().left;
        }

        var offsetLeft = left + boxWidth + 20 - $(window).width();
        if (offsetLeft > 0) {
            left -= offsetLeft;
        }
        box.css("left", left);

        var offsetTop = input.closest(".modal-content").length > 0 ? 30 : 0;
        var top = input.offset().top + getTruesHeight(input) - offsetTop + 3;
        if (position === "top" || input.offset().top + boxHeight + getTruesHeight(input) > $(window).height()) {
            var top2 = input.offset().top - boxHeight - 8 - offsetTop;
            if (top2 > 65) {
                top = top2;
            }
        }
        box.css("top", top);
    };
    return {
        alert: alert,
        timerAlert: timerAlert,
        delayAlert: delayAlert,
        each: each,
        isBlank: isBlank,
        isNotBlank: isNotBlank,
        addPageChangeHandler: addPageChangeHandler,
        pageChangeHandler: pageChangeHandler,
        isWeekend: isWeekend,//判断是否为周末
        maxDays: maxDays,//获取该月最大天数
        getMaxDayStr: getMaxDayStr,
        destroy: destroy,
        getParent: getParent,
        getString: getString,
        getInt: getInt,
        getIntValue: getIntValue,
        getFloat: getFloat,
        getFloatValue: getFloatValue,
        listenerDOM: listenerDOM,//监听节点变化
        getUrlParams: getUrlParams,
        getMultipleValue: getMultipleValue,
        getRandomId: getRandomId,
        positionInput: function (input) {
            positionInput(input, input);
        },
        getTruesHeight: getTruesHeight,
        getPxNumber: getPxNumber,
        getFilePostfix: getFilePostfix,//获得文件名后缀
        inputBoxPosition: inputBoxPosition
    };
});