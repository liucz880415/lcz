"use strict";
define(["main-app", "jquery", "tools"], function (app, $, tools) {

    app.directive("tdLimitSpan", [
        function () {
            return {
                scope: {
                    jyText: "=",
                    jyaOffsetWidth: "@",//最大显示宽度等于父级元素宽度-参数数据 默认为10
                    jyaIndexOf: "@",
                    jyaShowTitle: "@"
                },
                restrict: "E",
                template: "<div class='text-overflow-ellipsis div-center'>" +
                "<nobr>{{jyText}}</nobr>" +
                "</div>",
                replace: true,
                link: function ($scope, element, attributes) {
                    $scope.$watch("jyText", function () {
                        if ($scope.jyaShowTitle !== 'false') {
                            element.attr("title", $scope.jyText);
                        }
                    });

                    var widthFlag = false;
                    var setWidth = function () {
                        if (widthFlag) {
                            return;
                        }
                        try {
                            var blankTr = tools.getParent(element, "table").find(".blank-line:eq(0)").children();
                            var indexOf;
                            if ($scope.jyaIndexOf) {
                                indexOf = parseInt($scope.jyaIndexOf);
                            } else {
                                var indexFlag = false;
                                indexOf = -1;
                                var tdList = [];
                                var selfTd = tools.getParent(element, "td");
                                var tr = tools.getParent(element, "tr").children();
                                for (var i = 0; i < tr.length; i++) {
                                    var td = $(tr[i]);
                                    if (td.css("display") !== "none") {
                                        tdList.push(tr[i]);
                                        if (!indexFlag) {
                                            indexOf++;
                                        }
                                        if (selfTd.is(td)) {
                                            indexFlag = true;
                                        }
                                    }
                                }
                                if (blankTr.length != tdList.length) {
                                    setTimeout(setWidth, 30);
                                    return;
                                }
                            }

                            var width = tools.getInt(blankTr.eq(indexOf).attr("width"));
                            var offsetWidth = tools.getInt($scope.jyaOffsetWidth);
                            if (offsetWidth === 0) {
                                offsetWidth = 10;
                            }
                            width = width - offsetWidth - 20;
                            if (width <= 10) {
                                setTimeout(setWidth, 30);
                                return;
                            }
                            element.width(width);
                            widthFlag = true;
                        } catch (e) {
                        }
                    };
                    setWidth();
                    $scope.$on("tableSizeChange", setWidth);
                }
            };
        }
    ]);
});