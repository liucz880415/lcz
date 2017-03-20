"use strict";
define(["main-app", "main-data", "jquery", "tools"], function (app, navData, $, tools) {
    app.factory("http", ["$http", "$timeout", "$templateRequest", "modal",
        function ($http, $timeout, $templateRequest, modal) {
            var defaultParams = {
                //这一部分是原生的属性
                method: "",//通过调用get post方法设置 自己设置参数无效
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                responseType: "json",
                alwaysPrompt: false,//总是提示错误
                //这一部分是我们的功能属性
                success: null,//function(response) 成功事件
                error: null,//function(response) 失败事件
                always: null,//不管成功失败都会执行
                errorCode: null,
                status: null,
                mask: false,//遮盖
                //errorCode: {
                //    "100": function () {
                //      do something
                //    }
                //},
                relatedButton: "",//相关联的按钮 请求发送时会禁用按钮 直到返回时放开 值是jquery对象 或者Jquery选择器
                relatedButtonText: "请求中",//在请求发送中显示的文字
                offTimeout: false,//超时不做处理
                relatedOther: [],//相关联的其他控件 请求过程中会设置disabled属性
                filterData: []//过滤掉data中不需要的key
            };

            var timeoutAlert = false;
            var timeoutQueue = null;

            /**
             * 静默登录微信  只有在第一次页面打开时验证 路由跳转不做处理
             */
            var http = function (params, method) {
                params = $.extend(true, {}, defaultParams, params);
                params.method = method;

                if (!params.url) {
                    alert("url不能为空！");
                    return;
                }
                if (params.url.indexOf(MyConstants.BASE_URL) < 0 && params.url.indexOf("http") != 0) {
                    if (MyConstants.HTTP_DEBUG) {
                        params.url = MyConstants.FILE_URL + "/debug/http/" + (params.url.charAt(0) == "/" ? params.url : "/" + params.url) + ".json";
                    } else {
                        params.url = MyConstants.BASE_URL + (params.url.charAt(0) == "/" ? params.url : "/" + params.url);
                    }
                }
                var resetButton;
                if (params.relatedButton || params.relatedOther) {
                    var relatedButton = null;
                    if (params.relatedButton) {
                        relatedButton = $(params.relatedButton);

                        var oldButtonText;
                        if (params.relatedButtonText) {
                            oldButtonText = relatedButton.html();
                            relatedButton.html(params.relatedButtonText);
                        }
                        relatedButton.focus();
                        relatedButton.attr("disabled", "disabled");
                    }

                    if (params.relatedOther) {
                        angular.forEach(params.relatedOther, function (related) {
                            $(related).attr("disabled", "disabled");
                        });
                    }

                    resetButton = function () {
                        if (params.relatedButton) {
                            relatedButton.removeAttr("disabled");
                            if (params.relatedButtonText) {
                                relatedButton.html(oldButtonText);
                            }
                        }
                        if (params.relatedOther) {
                            angular.forEach(params.relatedOther, function (related) {
                                $(related).removeAttr("disabled");
                            });
                        }
                    };
                }

                if (params.filterData && params.filterData.length > 0) {
                    var data = $.extend(true, {}, {}, params.data);
                    angular.forEach(params.filterData, function (key) {
                        delete data[key];
                    });
                    params.data = data;
                }

                var success = function (response) {
                    resetButton && resetButton();
                    params.success && params.success(response.data, response);
                    params.always && params.always(response.data, response);
                };

                var error = function (response) {
                    if (params.status && params.status[response.status]) {
                        params.status[response.status](response.data);
                        return;
                    }
                    if (response.status > 500) {
                        tools.alert("网络异常，请刷新页面！", function () {
                            window.location.reload();
                        });
                        return;
                    } else if (response.status == 500) {
                        if (response.data && params.errorCode && params.errorCode[response.data.code]) {
                            params.errorCode[response.data.code](response.data);
                        } else {
                            if (!response.data || !response.data.message) {
                                tools.alert("网络异常，请刷新页面！");
                            } else if (!params.error || params.alwaysPrompt) {
                                tools.alert(response.data.message);
                            }
                        }
                    } else if (response.status == 401 || response.status === 302 || response.status === -1) {
                        if (params.offTimeout) {
                            return;
                        }
                        if (timeoutQueue == null) {
                            timeoutQueue = [];
                        }
                        timeoutQueue.push({
                            params: params,
                            method: method
                        });
                        if (timeoutAlert) {
                            return;
                        }
                        timeoutAlert = true;
                        modal.open({
                            url: MyConstants.FILE_URL + "/js/core/view/modal/login.html",
                            close: function () {
                                tools.each(timeoutQueue, function (item) {
                                    http(item.params, item.method);
                                });
                                timeoutQueue = null;
                                timeoutAlert = false;
                            }
                        });
                    }
                    resetButton && resetButton();
                    params.error && params.error(response.data);
                    params.always && params.always(response.data);
                };
                if (MyConstants.HTTP_DEBUG) {
                    $templateRequest(params.url + "?vid=" + (new Date().getTime())).then(function (json) {
                        $timeout(function () {
                            console.log(json);
                            success({
                                data: JSON.parse(json)
                            });
                        }, 50);
                    });
                } else {
                    $http(params).then(success, error);
                }
            };

            var get = function (params) {
                http(params, "GET");
            };

            var post = function (params) {
                http(params, "POST");
            };
            return {
                get: get,
                post: post
            };
        }
    ]);
});