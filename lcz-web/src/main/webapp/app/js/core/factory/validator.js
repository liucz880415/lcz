"use strict";
/**
 */
define(["main-app", "jquery", "tools"], function (app, $, tools) {
    app.factory("validator", ["$timeout", "idCard", "notify",
        function ($timeout, idCard, notify) {
            var numberReg = /^[0-9]*$/;
            var doubleReg = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
            var decimalReg = /^\d+(\.\d+)?$/;
            var mobileReg = /^1[34578]\d{9}$/;
            var nameReg = /^[\u4e00-\u9fa5 ·•]+$/;

            var validate = {
                isNumber: function (text) {
                    return numberReg.test(text);
                },
                isDouble: function (text) {
                    return doubleReg.test(text);
                },
                isDecimal: function (text) {
                    return decimalReg.test(text);
                },
                isMobile: function (text) {
                    return mobileReg.test(text);
                },
                isName: function (text) {
                    return nameReg.test(text);
                },
                isIdCard: function (text) {
                    return idCard.validate(text);
                }
            };

            var positionErrorInput = function (input, element) {
                element = element.parent();
                if (element == null || element.length == 0 || element[0] === document) {
                    input.focus();
                    return;
                }
                var overflowY = element.css("overflow-y");
                if (overflowY !== "auto" && overflowY !== "show" && overflowY !== "overlay") {
                    positionErrorInput(input, element);
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

            var addValidatorListener = function (input, $inputValidator, customHandler) {
                var validateKeyUp = function () {
                    if (input.attr("jyv-validate") === "false") {
                        return null;
                    }

                    if ($inputValidator.$error.required) {
                        return input.attr("jyv-required-message") ? input.attr("jyv-required-message") : "必填项";
                    }
                    if ($inputValidator.$error.maxlength) {
                        return "最大长度为" + input.attr("ng-maxlength");
                    }

                    if (input.val()) {
                        var jyvType = input.attr("jyv-type");
                        if (jyvType) {
                            var value = input.val();
                            if (jyvType === "number") {
                                if (!validate.isNumber(value)) {
                                    return "只能为整数";
                                }

                                var jyvMaxNumber = input.attr("jyv-maxnumber");
                                if (jyvMaxNumber) {
                                    jyvMaxNumber = parseInt(jyvMaxNumber);
                                    var numberValue = parseInt(value);
                                    if (numberValue > jyvMaxNumber) {
                                        return "最大值为" + jyvMaxNumber;
                                    }
                                }
                            } else if (jyvType === "double") {
                                if (!validate.isDouble(value)) {
                                    return "只能为数字";
                                }
                            } else if (jyvType === "decimal") {
                                if (!validate.isDecimal(value)) {
                                    return "只能为数字";
                                }
                            } else if (jyvType === "name") {
                                if (!validate.isName(value)) {
                                    return "姓名只能是汉字";
                                }
                            }
                        }

                        if (customHandler && customHandler.keyup && customHandler.keyup[input.name()]) {
                            var customResponse = customHandler.keyup[input.name()](input);
                            if (customResponse) {
                                return customResponse;
                            }
                        }
                    }
                    return null;
                };

                var validateBlur = function (callback) {
                    if (input.attr("jyv-validate") === "false") {
                        callback(null);
                        return;
                    }
                    var message = validateKeyUp();
                    if (message) {
                        callback(message);
                        return;
                    }
                    if ($inputValidator.$error.minlength) {
                        callback("最小长度为" + input.attr("ng-minlength"));
                        return;
                    }
                    if ($inputValidator.$error.pattern) {
                        callback(input.attr("ng-pattern-message"));
                        return;
                    }
                    if ($inputValidator.$error.email) {
                        callback("邮箱格式不正确");
                        return;
                    }
                    var value = input.val();
                    if (value) {
                        var jyvType = input.attr("jyv-type");
                        if (jyvType) {
                            if (jyvType === "number") {
                                var jyvMinNumber = input.attr("jyv-minnumber");
                                if (jyvMinNumber) {
                                    jyvMinNumber = parseInt(jyvMinNumber);
                                    var numberValue = parseInt(value);
                                    if (numberValue < jyvMinNumber) {
                                        callback("最小值为" + jyvMinNumber);
                                        return;
                                    }
                                }
                            } else if (jyvType === "idCard") {
                                if (!validate.isIdCard(value)) {
                                    callback("证件号验证错误");
                                    return;
                                }
                            } else if (jyvType === "mobile") {
                                if (!validate.isMobile(value)) {
                                    callback("手机号码不正确");
                                    return;
                                }
                            } else if (jyvType === "name") {
                                var _value = value.replaceAll("•", "·");
                                if (_value.charAt(0) == "·" || _value.charAt(_value.length - 1) == "·" || _value.indexOf("··") > -1) {
                                    callback("请输入正确的姓名 如：张三、阿孜古丽·尼加提");
                                    return;
                                }
                            }
                        }

                        var jyvEqualsLength = input.attr("jyv-equals-length");
                        if (jyvEqualsLength) {
                            if (value.length != parseInt(jyvEqualsLength)) {
                                callback("长度必须为" + jyvEqualsLength + "位");
                                return;
                            }
                        }
                        if (customHandler && customHandler.blur && customHandler.blur[input.attr("name")]) {
                            var customResponse = customHandler.blur[input.attr("name")](input);
                            if (customResponse) {
                                if (angular.isString(customResponse)) {
                                    callback(customResponse);
                                    return;
                                } else if (angular.isObject(customResponse)) {
                                    customResponse.then(function (customResponseMessage) {
                                        callback(customResponseMessage);
                                    });
                                    return;
                                }
                            }
                        }
                    }
                    callback(null);
                };

                var notifyMessage = function (message) {
                    $timeout(function () {
                        if (message) {
                            notify.input({
                                input: input,
                                message: message
                            })
                        } else {
                            notify.input({
                                input: input,
                                message: null
                            })
                        }
                    }, 30);
                };

                input.off("keyup.validator");
                input.off("change.validator");
                input.off("blur.validator");

                input.on("keyup.validator", function () {
                    if (!input.val())return;
                    notifyMessage(validateKeyUp());
                });
                input.on("change.validator", function () {
                    notifyMessage(validateKeyUp());
                });
                input.on("blur.validator", function () {
                    if (input.attr("jyv-blur-flag") === "false") {
                        return;
                    }
                    validateBlur(function (message) {
                        notifyMessage(message);
                    });
                });

                return {
                    validateNow: function (callback, commonStatus) {
                        validateBlur(function (message) {
                            notifyMessage(message);
                            callback(message);
                            if (commonStatus) {
                                if (!commonStatus.positionErrorInputFlag && message) {
                                    commonStatus.positionErrorInputFlag = true;
                                    positionErrorInput(input, input);
                                }
                            }
                        });
                    }
                };
            };

            var create = function (formName, $scope, customHandler, moment) {
                var form = $("form[name='" + formName + "']");
                if (form.length === 0) {
                    if ($scope.element) {
                        form = $scope.element.find("form[name='" + formName + "']");
                    }
                }
                var destroy = false;
                var validatorList = [];
                var validatorInputList = [];

                var forEachElement = function () {
                    var $validator = $scope[formName];
                    for (var key in $validator) {
                        if (key.charAt(0) === "$") {
                            continue;
                        }
                        var input = form.find("[name='" + key + "']");
                        validatorInputList.push(input);
                        validatorList.push(addValidatorListener(input, $validator[key], customHandler));
                    }
                };

                if (moment) {
                    forEachElement();
                } else {
                    $scope.$watch(formName, function () {
                        var timer = setTimeout(function () {
                            clearTimeout(timer);
                            forEachElement();
                        }, 500);
                    });
                }

                var _interface = {
                    positionErrorInput: function (name) {
                        var input = form.find("[name='" + name + "']");
                        positionErrorInput(input, input);
                    }
                };

                return {
                    validateNow: function (success, error, relatedButton) {
                        if (destroy) {
                            return;
                        }
                        if (error && !angular.isFunction(error)) {
                            relatedButton = error;
                        }
                        var resetButton;
                        if (relatedButton) {
                            relatedButton = $(relatedButton);
                            var oldButtonText = relatedButton.html();
                            relatedButton.attr("disabled", "disabled");
                            relatedButton.text("校验中...");

                            resetButton = function () {
                                relatedButton.removeAttr("disabled");
                                relatedButton.html(oldButtonText);
                            };
                        }

                        var alreadyCallback = false;
                        var responseLength = 0;
                        if (validatorList.length === 0) {
                            resetButton && resetButton();
                            success && success(_interface);
                        } else {
                            var commonStatus = {
                                positionErrorInputFlag: false,
                                openFlag: false
                            };
                            angular.forEach(validatorList, function (_validator) {
                                _validator.validateNow(function (message) {
                                    if (alreadyCallback) {
                                        return;
                                    }
                                    if (message) {
                                        alreadyCallback = true;
                                        resetButton && resetButton();
                                        error && error(_interface);
                                    } else if (++responseLength === validatorList.length) {
                                        resetButton && resetButton();
                                        success && success(_interface);
                                    }
                                }, commonStatus);
                            });
                        }
                    },
                    destroy: function () {
                        tools.each(validatorInputList, function (input) {
                            input.off("keyup.validator");
                            input.off("change.validator");
                            input.off("blur.validator");
                        });
                        destroy = true;
                    }
                }
            };

            var external = {
                create: create
            };
            $.extend(external, validate);
            return external;
        }
    ]);
});