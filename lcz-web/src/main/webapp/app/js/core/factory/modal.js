"use strict";
define(["main-app", "main-data", "jquery", "tools", "angular"], function (app, mainData, $, tools, angular) {
    app.factory("modal", ["$rootScope", "$timeout", "$templateRequest", "$compile", "$location", "escKeydown",
        function ($rootScope, $timeout, $templateRequest, $compile, $location, escKeydown) {
            var modalParams = {
                data: null,//传参 传入到modal scope上的data属性上
                share: null,//共享对象 慎用 注意销毁
                controller: "",
                //close: function (resultData) {
                //    //返回对象
                //},
                //notify: function(resultData){
                //    //返回对象 不关闭页面
                //},
                relatedButton: "",//相关联的按钮 打开窗口时会禁用按钮 直到返回时放开 值是jquery对象 或者Jquery选择器
                relatedButtonText: "打开中",//在打开中显示的文字
                relatedOther: [],//相关联的其他控件 请求过程中会设置disabled属性
                effectsShow: "fadeInDown",
                effectsHide: "fadeOutUp"
            };
            var $body = $("body");
            var openFlagMap = {};

            var open = function (params) {
                var url = params.url;
                if (!url) {
                    throw new Error("url不能为空")
                }

                if (url.indexOf(MyConstants.BASE_URL) < 0) {
                    url = "/view/" + mainData.module + "/" + $location.path().split(".")[0] + "/modal/" + url + ".html";
                    url = MyConstants.FILE_URL + url.split("//").join("/");
                }
                if (openFlagMap[url]) {
                    return;
                }
                var escCloseInterface = {
                    close: null
                };
                openFlagMap[url] = true;

                var share = params ? params.share : null;

                params = $.extend(true, {}, modalParams, params ? params : {});

                var resetButton;
                if (params.relatedButton) {
                    var relatedButton = $(params.relatedButton);
                    var oldButtonText;
                    if (params.relatedButtonText) {
                        oldButtonText = relatedButton.html();
                    }
                    relatedButton.attr("disabled", "disabled");
                    angular.forEach(params.relatedOther, function (related) {
                        $(related).attr("disabled", "disabled");
                    });
                    if (oldButtonText) {
                        relatedButton.html(params.relatedButtonText);
                    }

                    resetButton = function () {
                        relatedButton.removeAttr("disabled");
                        angular.forEach(params.relatedOther, function (related) {
                            $(related).removeAttr("disabled");
                        });
                        relatedButton.html(oldButtonText);
                    };
                }
                var $scope = $rootScope.$new(true);
                var modalElement;

                if (params.data != null) {
                    $scope.data = angular.copy(params.data);
                }
                $scope.share = share;
                var eventId = Math.random().toString().replace(".", "");
                $scope.close = function (resultData, closeEndHandler) {
                    modalElement.addClass(params.effectsHide);
                    setTimeout(function () {
                        $timeout(function () {
                            if (resultData != null) {
                                params && params.close && params.close(resultData);
                            }
                        }, 0);
                        modalElement.remove();
                        $(window).off("resize.modal" + eventId);
                        closeEndHandler && closeEndHandler();
                        $scope.data = null;
                        $scope.share = null;
                        $scope.$destroy();
                        openFlagMap[url] = false;

                        if (modalElement.find(".close").length > 0) {
                            escKeydown.modalArray.splice(escKeydown.modalArray.indexOf(escCloseInterface), 1);
                        }
                    }, 500);
                };

                if (params != null && params.notify != null) {
                    $scope.notify = params.notify;
                }

                var promise = $templateRequest(url + "?vid=" + MyConstants.VERSION);
                promise.then(function (modalHtml) {
                    var ngModal = angular.element(modalHtml);
                    if (params.controller) {
                        ngModal.attr("ng-controller", params.controller);
                    }
                    $scope.element = ngModal;
                    modalElement = $compile(ngModal)($scope);
                    $(document.body).append(modalElement);

                    if (!modalElement.hasClass("no-resize")) {
                        var modalBody = modalElement.find(".modal-body");
                        var modalFooter = modalElement.find(".modal-footer");
                        if (modalBody.length > 0) {
                            var modalCenter = $(".modal-center");
                            if (modalCenter.length > 0) {
                                $scope.windowResize = function () {
                                    var marginTop = (($(window).height() - modalCenter.height()) / 2) + tools.getInt(modalCenter.attr("offset-top"), 0);
                                    if (marginTop < 10) {
                                        marginTop = 10;
                                    }
                                    modalCenter.css("margin-top", marginTop);
                                };
                            } else {
                                modalBody.css("overflow-y", "auto");
                                var timer;
                                modalBody.scroll(function () {
                                    if (timer) {
                                        return;
                                    }
                                    timer = setTimeout(function () {
                                        $(document).click();
                                        clearTimeout(timer);
                                        timer = null;
                                    }, 50)
                                });

                                $scope.windowResize = function () {
                                    var top = modalBody.offset().top === 0 ? 87 : modalBody.offset().top;
                                    var maxHeight = $(window).height() - top - 25;

                                    if (modalFooter.length > 0) {
                                        maxHeight -= tools.getTruesHeight(modalFooter);
                                    }
                                    modalBody.css("max-height", maxHeight);
                                };
                            }
                            var count = 0;
                            var iTimer = setInterval(function () {
                                $scope.windowResize();
                                if (count++ > 20) {
                                    clearInterval(iTimer);
                                }
                            }, 30);
                            $(window).on("resize.modal" + eventId, $scope.windowResize);
                        }
                    }
                    modalElement.show();
                    modalElement.addClass("animated " + params.effectsShow);
                    $body.append(modalElement);
                    setTimeout(function () {
                        modalElement.find(".init-focus").focus();
                        $(window).resize();
                        modalElement.removeClass(params.effectsShow);
                    }, 500);
                    if (modalElement.find(".close").length > 0) {
                        openFlagMap[url] = $scope.close;
                    } else {
                        openFlagMap[url] = tools.noop;
                    }
                    if (modalElement.find(".close").length > 0) {
                        escCloseInterface.close = $scope.close;
                        escKeydown.modalArray.push(escCloseInterface);
                    }
                    resetButton && resetButton();
                }, function () {
                    tools.alert("页面找不到！");
                    resetButton && resetButton();
                });
                return {
                    close: $scope.close
                }
            };

            return {
                open: open,
                hasOpen: function () {
                    for (var key in openFlagMap) {
                        if (openFlagMap[key]) {
                            return true;
                        }
                    }
                    return false;
                }
            };
        }
    ]);
});