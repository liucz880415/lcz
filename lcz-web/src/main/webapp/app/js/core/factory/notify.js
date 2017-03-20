"use strict";
define(["main-app", "tools"], function (app, tools) {
    app.factory("notify", ["destroy",
        function (destroy) {
            var constants = {
                ID: "jy-notify-id",
                ARROW_WIDTH: 5,
                ARROW_HEIGHT: 10,
                CONTAINER_HEIGHT: 35
            };

            var inputDefaultParams = {
                message: null,//提示信息
                input: null,//文本框
                timer: false,//显示毫秒 false为一直显示

                //这几个暂时不做 有需要再做
                direction: "right",//方向
                type: "error"//类型
            };

            var notifyWrapperTemplate = " <div class='notify-wrapper'>" +
                "<div class='notify-arrow'></div>" +
                "<div class='notify-container'>" +
                "<div class='notify-bootstrap-base'>" +
                "<span class='notify-message'>&nbsp;</span>" +
                "</div>" +
                "</div>" +
                "</div>";

            var notifyIdOpen = {};

            var closeInput = function ($notifyWrapper, notifyId) {
                if (notifyIdOpen[notifyId]) {
                    $notifyWrapper.addClass("fadeOut");
                    setTimeout(function () {
                        $notifyWrapper.remove();
                        delete notifyIdOpen[notifyId];
                    }, 500);
                }
            };

            var input = function (params) {
                params = $.extend(true, {}, inputDefaultParams, params);
                var notifyId = params.input.attr(constants.ID);
                if (!notifyId) {
                    notifyId = tools.getRandomId();
                    params.input.attr(constants.ID, notifyId);
                }
                var $input = $(params.input);

                var $oldNotifyWrapper = $input.prev(".notify-wrapper:eq(0)");
                if ($oldNotifyWrapper.attr(constants.ID) == notifyId) {
                    if (params.message) {
                        $oldNotifyWrapper.find(".notify-message").html(params.message);
                    } else {
                        closeInput($oldNotifyWrapper, notifyId);
                    }
                    return;
                }
                if (!params.message) {
                    return;
                }
                if (notifyIdOpen[notifyId]) {
                    return;
                }
                notifyIdOpen[notifyId] = true;
                var $notifyWrapper = $(notifyWrapperTemplate);
                $notifyWrapper.attr(constants.ID, notifyId);
                var $notifyArrow = $notifyWrapper.find(".notify-arrow");
                var $notifyContainer = $notifyWrapper.find(".notify-container");
                var $notifyMessage = $notifyWrapper.find(".notify-message");
                var $notifyBootstrapBase = $notifyWrapper.find(".notify-bootstrap-base");
                if (params.type === "error") {
                    $notifyBootstrapBase.addClass("notify-bootstrap-error");
                }

                $notifyMessage.html(params.message);

                $notifyWrapper.click(function () {
                    closeInput($notifyWrapper, notifyId);
                });

                var inputWidth = $input.width();
                inputWidth += tools.getPxNumber($input.css("padding-left"));
                inputWidth += tools.getPxNumber($input.css("padding-right"));

                var inputHeight = $input.height();
                inputHeight += tools.getPxNumber($input.css("padding-top"));
                inputHeight += tools.getPxNumber($input.css("padding-bottom"));

                if (params.direction === "right") {
                    $notifyArrow.css({
                        "border-top": " 5px solid transparent",
                        "border-bottom": "5px solid transparent",
                        "border-right": "5px solid rgb(238, 211, 215)",
                        "left": inputWidth + 1,
                        "top": (inputHeight / 2) - (constants.ARROW_HEIGHT / 2)
                    });

                    $notifyContainer.css({
                        "left": inputWidth + constants.ARROW_WIDTH + 1,
                        "top": -((constants.CONTAINER_HEIGHT - inputHeight) / 2)
                    });
                }

                $input.before($notifyWrapper);
                $notifyWrapper.addClass("animated fadeIn");
                setTimeout(function () {
                    $notifyWrapper.removeClass("fadeIn");
                }, 500);

                if (params.timer) {
                    setTimeout(function () {
                        closeInput($notifyWrapper, notifyId);
                    }, params.timer);
                }
            };
            return {
                input: input
            };
        }
    ]);
});