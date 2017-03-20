"use strict";
define(["main-app", "tools"], function (app, tools) {

    var rowsSelectList = [10, 20, 50, 100];//每页多少条选择
    var showBtnLength = 2;//前后按钮个数

    app.directive("tableBox", ["$compile", "$location", "$timeout", "$templateRequest", "windowResize", "destroy", "userConfig",
        function ($compile, $location, $timeout, $templateRequest, windowResize, destroy, userConfig) {
            return {
                scope: {
                    jyPageData: "=",//数据 用来显示没有数据的状态
                    jyOffsetHeight: "=?",//计算撑满的高度偏移量 只有下面有其他东西的才需要设置 上面的不用
                    jyQueryParams: "=?",//查询条件
                    jyDataComparison: "=?",//数据比对
                    jyaTitle: "@",//标题
                    jyaHeightPercent: "@",//高度的百分比
                    jyaParamsKey: "@",//如果一个页面有两个表格需要设置不同的KEY
                    jyaHidePage: "@",//不需要分页
                    jyfQuery: "&",//查询
                    jyaAutoQuery: "@",//默认true 组件初始化好会直接调用jyfQuery方法  设置为false则不会
                    jyExecuteQuery: "=?",//手动调用查询 设置为true则会查询 结束会变成false
                    jyaDefaultColumnWidth: "@",//默认每列的宽度
                    jyaDataComparisonKey: "@?"//数据比对的ID 用来区分是否是同一条数据
                },
                restrict: "E",
                template: "",
                replace: true,
                link: function ($scope, element) {
                    var $window = $(window);
                    /**** 表格 ***/
                    element.css("opacity", "0");
                    element.addClass("table-box position-relative");
                    var message = $("<div class='table-message'></div>");
                    var loading = $("<div class='table-loading'><span class='icon-spinner icon-spin'></span></div>");
                    element.append(loading);
                    element.append(message);
                    var bodyTable = element.find(".body-box").find("table:eq(0)");
                    var footTable = element.find(".foot-box").find("table:eq(0)");
                    var leftBodyTable = element.find(".left-body-box").find("table:eq(0)");
                    var leftFootTable = element.find(".left-body-box").find("table:eq(0)");
                    if (leftBodyTable.length > 0) {
                        leftBodyTable.append("<tr style='height: 22px;'></tr>");
                    }

                    var bodyBlankLine = $("<tr class='blank-line'></tr>");
                    var footBlankLine = $("<tr class='blank-line'></tr>");
                    var leftBodyBlankLine = $("<tr class='blank-line'></tr>");
                    var leftFootBlankLine = $("<tr class='blank-line'></tr>");

                    bodyTable.append(bodyBlankLine);
                    if (footTable.length > 0) {
                        footTable.append(footBlankLine);
                    }
                    if (leftBodyTable.length > 0) {
                        leftBodyTable.append(leftBodyBlankLine);
                    }
                    if (leftFootTable.length > 0) {
                        leftFootTable.append(leftFootBlankLine);
                    }

                    $scope.$watch("loading", function () {
                        if ($scope.loading) {
                            message.hide();
                            loading.show();
                        } else {
                            loading.hide();
                        }
                    });

                    $scope.$watch("jyPageData.content", function () {
                        if ($scope.jyPageData) {
                            $scope.loading = false;
                        }
                        if (!$scope.jyPageData || !$scope.jyPageData.content || $scope.jyPageData.content.length > 0) {
                            message.hide();
                        } else {
                            message.html("未查找到数据");
                            message.show();
                        }
                    });

                    if ($scope.jyaTitle) {
                        element.prepend("<div style='padding: 5px;'><strong>" + $scope.jyaTitle + "</strong></div>");
                    }

                    $compile(element, $scope.$rootScope);


                    var tableBox = element;
                    var headBox = tableBox.find(".head-box");
                    var bodyBox = tableBox.find(".body-box");

                    var leftHeadBox = tableBox.find(".left-head-box");
                    var leftBodyBox = tableBox.find(".left-body-box");

                    var timer;
                    bodyBox.scroll(function () {
                        if (timer) {
                            return;
                        }
                        timer = setTimeout(function () {
                            $(document).click();
                            clearTimeout(timer);
                            timer = null;
                        }, 50);
                    });

                    var footBox = tableBox.find(".foot-box");
                    if (footBox.hasClass("foot-box-no-overflow")) {
                        footBox = $("");
                    }
                    var leftFootBox = tableBox.find(".left-foot-box");

                    footBox.css("overflow-x", "hidden");
                    bodyBox.scroll(function () {
                        //某些浏览器在使用overflow-y = overlay 会影响到overflow-x show的最大可以滚动距离
                        if (bodyBox[0].scrollLeft + bodyBox[0].offsetWidth > bodyBox[0].scrollWidth) {
                            bodyBox[0].scrollLeft = bodyBox[0].scrollWidth - bodyBox[0].offsetWidth;
                        }
                        headBox[0].scrollLeft = bodyBox[0].scrollLeft;
                        if (footBox.length > 0) {
                            footBox[0].scrollLeft = bodyBox[0].scrollLeft;
                        }
                        if (leftBodyBox.length > 0) {
                            leftBodyBox[0].scrollTop = bodyBox[0].scrollTop;
                        }
                    });

                    var defaultColumnWidth = tools.getInt($scope.jyaDefaultColumnWidth);
                    if (!defaultColumnWidth) {
                        defaultColumnWidth = 100;
                    }
                    setTimeout(function () {
                        var rightWidthCalculation = function (_headBox, _bodyBox, _footBox, _bodyBlankLine, _footBlankLine) {
                            var headTds = _headBox.find(".head-tr");
                            if (headTds.length > 0) {
                                headTds = headTds.children();
                            } else {
                                headTds = _headBox.find("tr:eq(0)").children();
                            }
                            var minWidth = 0;

                            var blankLineHtml = "";
                            for (var i = 0; i < headTds.length; i++) {
                                var item = $(headTds[i]);
                                if (item.css("display") !== "none" || item.hasClass("width-hide")) {
                                    var width = tools.getInt(item.attr("width"));
                                    if (!width && defaultColumnWidth) {
                                        width = defaultColumnWidth;
                                    }
                                    width = width ? width : tools.getInt(item.width());
                                    item.attr("width", width);
                                    blankLineHtml += "<td style='width:" + width + "px;' width='" + width + "'></td>";
                                    item.width(width - 1);
                                    minWidth += width;
                                }
                            }

                            _bodyBlankLine.html(blankLineHtml);
                            _footBlankLine.html(blankLineHtml);

                            if (_headBox.length > 0) {
                                _headBox.find("table:eq(0)").css("width", minWidth);
                            }
                            if (_bodyBox.length > 0) {
                                _bodyBox.find("table:eq(0)").css("width", minWidth);
                            }
                            if (_footBox.length > 0) {
                                _footBox.find("table:eq(0)").css("width", minWidth);
                            }
                            $scope.$parent.$broadcast("tableSizeChange");
                            setTimeout(function () {
                                $scope.$parent.$broadcast("tableSizeChange");
                                element.animate({
                                    opacity: 1
                                }, 500);
                            }, 100);
                        };

                        rightWidthCalculation(headBox, bodyBox, footBox, bodyBlankLine, footBlankLine);
                        rightWidthCalculation(leftHeadBox, leftBodyBox, leftFootBox, leftBodyBlankLine, leftFootBlankLine);
                        destroy.addDestroyListener(tools.listenerDOM(headBox[0], function () {
                            rightWidthCalculation(headBox, bodyBox, footBox, bodyBlankLine, footBlankLine);
                            rightWidthCalculation(leftHeadBox, leftBodyBox, leftFootBox, leftBodyBlankLine, leftFootBlankLine);
                        }).destroy)
                    }, 300);
                    $scope.windowResize = function (width, height, offsetTop, heightAnimate) {
                        if (bodyBox.offset().top === 0) {
                            bodyBox.css("height", 1);
                            leftBodyBox.css("height", 1);
                            return;
                        }

                        var maxHeight;

                        if ($scope.jyaHeightPercent) {
                            maxHeight = (height - 110) * tools.getFloat($scope.jyaHeightPercent)
                            - tools.getInt(element.find(".search-panel-box").height())
                            - tools.getInt(footBox.height())
                            - tools.getInt(headBox.height())
                            + tools.getInt(offsetTop);
                            if ($scope.jyaHidePage !== "true") {
                                maxHeight -= 41;
                            }
                            if ($scope.jyaTitle) {
                                maxHeight -= 32;
                            }
                        } else {
                            maxHeight = tools.getInt(height - bodyBox.offset().top - 27) + tools.getInt(offsetTop);
                            if ($("bottom-box").length == 1) {
                                maxHeight -= 36;
                            }
                            if ($scope.jyaHidePage !== "true") {
                                maxHeight -= 41;
                            }
                            if (footBox.length == 1) {
                                maxHeight -= 34;
                            }
                        }
                        if ($scope.jyOffsetHeight) {
                            maxHeight += parseInt($scope.jyOffsetHeight);
                        }
                        if (maxHeight <= 0 || (maxHeight > height - 100)) {
                            bodyBox.css("height", "inherit");
                            leftBodyBox.css("height", "inherit");
                            return;
                        }

                        if (heightAnimate) {
                            bodyBox.animate({
                                "height": maxHeight
                            }, 500);
                            leftBodyBox.animate({
                                "height": maxHeight
                            }, 500);
                        } else {
                            bodyBox.css("height", maxHeight);
                            leftBodyBox.css("height", maxHeight);
                        }
                        loading.css("top", element.height() / 2 - loading.height() / 2);
                        loading.css("left", element.width() / 2 - loading.width() / 2);
                        message.css("top", (element.height() + headBox.height()) / 2 - 20 / 2);
                        message.css("left", element.width() / 2 - 84 / 2);
                    };

                    windowResize.addHandlerAndDestroy($scope.windowResize);
                    setTimeout(function () {
                        $scope.windowResize($window.width(), $window.height());
                    }, 500);

                    var headTr1 = element.find(".left-head-box").find("tr:eq(0)");
                    var headTr2 = element.find(".head-box").find("tr:eq(0)");
                    $scope.borderTopChange = function (show) {
                        if ($scope.jyaTitle || show) {
                            headTr1.css({"border-top": "1px solid #e4e7ec"});
                            headTr2.css({"border-top": "1px solid #e4e7ec"});
                        } else {
                            headTr1.css({"border-top": "none"});
                            headTr2.css({"border-top": "none"});
                        }
                    };
                    $scope.borderTopChange(false);

                    /**** 查询面板 ***/
                    if (!$scope.jyQueryParams) {
                        $scope.jyQueryParams = {};
                    }
                    $scope.initQueryParams = angular.copy($scope.jyQueryParams);

                    if (!$scope.jyaParamsKey) {
                        $scope.jyaParamsKey = "";
                    }
                    $scope.jyaParamsKey = $scope.jyaParamsKey + $location.path().split(".").join("-") + "QueryParams";
                    var jyaParamsJson = $location.search()[$scope.jyaParamsKey];
                    if (jyaParamsJson) {
                        $scope.jyQueryParams = JSON.parse(jyaParamsJson);
                    }
                    $scope.updateQueryParams = function () {
                        var search = $location.search();
                        search[$scope.jyaParamsKey] = JSON.stringify($scope.jyQueryParams);
                        $location.search(search);
                    };

                    $scope.query = function () {
                        $timeout(function () {
                            $scope.updateQueryParams();
                            $scope.loading = true;
                            $scope.jyfQuery();
                        }, 20);
                    };

                    $scope.$watch("jyExecuteQuery", function (jyExecuteQuery) {
                        if (jyExecuteQuery && !$scope.loading) {
                            $scope.query();
                        }
                    });

                    var searchPanel = element.find(".search-panel");
                    if (searchPanel.length > 0) {
                        var searchPanelBox = searchPanel.find(".search-panel-box");
                        $scope.borderTopChange(true);
                        var searchPanelHeight = searchPanelBox.height();
                        var lastQueryParamsJson = "";
                        var searchDownButton = $("<span class='top-icons  icon-angle-up'></span>");
                        element.append(searchDownButton);
                        var running = false;
                        searchDownButton.click(function () {
                            if (running) {
                                return;
                            }
                            running = true;
                            if (searchPanelBox.height() > 20) {
                                searchPanelHeight = searchPanelBox.height();
                            }
                            if (searchDownButton.hasClass("icon-angle-down")) {
                                lastQueryParamsJson = JSON.stringify($scope.jyQueryParams);
                                searchDownButton.removeClass("icon-angle-down");
                                searchDownButton.addClass("icon-angle-up");
                                searchPanel.find("input:eq(0)").focus();
                                $scope.windowResize($(window).width(), $(window).height(), -searchPanelHeight, true);
                                $scope.borderTopChange(true);
                            } else if (searchDownButton.hasClass("icon-angle-up")) {
                                searchDownButton.removeClass("icon-angle-up");
                                searchDownButton.addClass("icon-angle-down");
                                $scope.windowResize($(window).width(), $(window).height(), searchPanelHeight, true);
                                $scope.borderTopChange(false);
                            }
                            searchPanel.animate({
                                height: "toggle",
                                opacity: "toggle"
                            }, 500, function () {
                                running = false;
                            });
                        });

                        var searchButton = $("<span class='top-icons icon-search' title='查询'></span>");
                        searchButton.click(function () {
                            $scope.$apply(function () {
                                $scope.query();
                            });
                        });
                        searchPanel.append(searchButton);

                        var resetButton = $("<span class='top-icons icon-remove' title='清空搜索条件'></span>");
                        resetButton.click(function () {
                            $scope.$apply(function () {
                                var jyQueryParams = angular.copy($scope.initQueryParams);
                                jyQueryParams.page = 1;
                                jyQueryParams.rows = $scope.jyQueryParams.rows;
                                jyQueryParams.sortId = null;
                                jyQueryParams.sortAsc = null;
                                for (var key1 in $scope.jyQueryParams) {
                                    delete  $scope.jyQueryParams[key1];
                                }
                                for (var key2 in jyQueryParams) {
                                    $scope.jyQueryParams[key2] = jyQueryParams[key2];
                                }
                                $scope.query();
                            });
                        });
                        searchPanel.append(resetButton);

                        setTimeout(function () {
                            searchPanel.find("input").keydown(function (event) {
                                if (event.keyCode == 13) {
                                    $scope.query();
                                }
                            });
                            searchPanel.find("select").keydown(function (event) {
                                if (event.keyCode == 13) {
                                    $scope.query();
                                }
                            });
                        }, 1000);
                    }

                    if ($scope.jyaHidePage !== "true") {
                        /**** 分页 ***/
                        if (!$scope.loading) {
                            $scope.loading = false;
                        }
                        if (!$scope.jyaPrefix) {
                            $scope.jyaPrefix = "";
                        }

                        var page = $scope.jyQueryParams.page;
                        var rows = $scope.jyQueryParams.rows;


                        if (tools.isNotBlank(page)) {
                            $scope.jyQueryParams.page = tools.getInt(page, 1);
                            if ($scope.jyQueryParams.page < 1) {
                                $scope.jyQueryParams.page = 1;
                            }
                        } else {
                            $scope.jyQueryParams.page = 1;
                        }

                        if (tools.isNotBlank(rows)) {
                            $scope.jyQueryParams.rows = tools.getInt(rows, userConfig.get(userConfig.constants.TABLE_ROWS));
                        } else {
                            $scope.jyQueryParams.rows = userConfig.get(userConfig.constants.TABLE_ROWS);
                        }
                        $scope.tempPage = $scope.jyQueryParams.page;

                        $scope.jumpPage = function (event, page) {
                            if (event && $(event.target).hasClass("disabled")) {
                                return;
                            }
                            if (page < 1) {
                                page = 1;
                            } else if ($scope.jyPageData["totalPages"] > 0 && page > $scope.jyPageData["totalPages"]) {
                                page = $scope.jyPageData["totalPages"];
                            }
                            $scope.jump(page);
                        };

                        $scope.jumpTempPage = function () {
                            if ($scope.tempPage === undefined) {
                                $scope.tempPage = 1;
                            }
                            $scope.jumpPage(null, $scope.tempPage);
                        };

                        $scope.jump = function (page) {
                            if ($scope.loading) {
                                return;
                            }
                            if (page < 1) {
                                page = 1;
                            }
                            $scope.jyQueryParams.page = page;
                            $scope.jyQueryParams.rows = parseInt($scope.rowsSelect);
                            $scope.loading = true;
                            $scope.query();
                        };

                        var rowsSelectFirst = true;
                        $scope.$watch("rowsSelect", function () {
                            var updateTableRows = true;
                            if (pageDataFirst) {
                                updateTableRows = false;
                            } else {
                                if ($scope.jyQueryParams.page > $scope.jyPageData["totalPages"]) {
                                    $scope.jyQueryParams.page = $scope.jyPageData["totalPages"];
                                }
                            }

                            if (rowsSelectFirst) {
                                rowsSelectFirst = false;
                                if ($scope.jyaAutoQuery !== "false") {
                                    $scope.jump($scope.jyQueryParams.page);
                                }
                            } else {
                                $scope.jump($scope.jyQueryParams.page);
                            }
                            if (updateTableRows) {
                                userConfig.save(userConfig.constants.TABLE_ROWS, $scope.rowsSelect);
                            }
                        });

                        $scope.rowsSelect = $scope.jyQueryParams.rows + "";

                        $scope.tempPageKeyDown = function (event) {
                            if (event.keyCode === 13) {
                                $scope.jumpTempPage();
                            }
                        };
                        var pageDataFirst = true;
                        $scope.$watch("jyPageData", function (jyPageData) {
                            if (!pageDataFirst) {
                                if ($scope.jyQueryParams.page > jyPageData["totalPages"]) {
                                    $scope.jyQueryParams.page = jyPageData["totalPages"];
                                    $scope.jump($scope.jyQueryParams.page);
                                    return;
                                }
                            }
                            pageDataFirst = false;
                            $scope.jyExecuteQuery = false;

                            $scope.tempPage = $scope.jyQueryParams.page;
                            $scope.truePage = $scope.jyQueryParams.page;
                            if (jyPageData) {
                                var before = $scope.jyQueryParams.page;
                                var showPageBtn = [];

                                var beforeBtnLength = before - showBtnLength;
                                for (var i = beforeBtnLength; i < $scope.jyQueryParams.page; i++) {
                                    if (i > 0) {
                                        showPageBtn.push(i);
                                    }
                                }
                                var surplus = showBtnLength - showPageBtn.length + 1;
                                for (var i = $scope.jyQueryParams.page; i < $scope.jyQueryParams.page + showBtnLength + surplus && i <= jyPageData["totalPages"]; i++) {
                                    if (showPageBtn.length < showBtnLength * 2 + 1 && i > 0) {
                                        showPageBtn.push(i);
                                    }
                                }

                                if (showPageBtn.length > 0) {
                                    while (showPageBtn.length < showBtnLength * 2 + 1) {
                                        var p = showPageBtn[0];
                                        if (p <= 1) {
                                            break;
                                        } else {
                                            showPageBtn.push(p - 1);
                                            showPageBtn.sort(function (a, b) {
                                                return a > b ? 1 : -1
                                            });
                                        }
                                    }
                                    $scope.showPageBtn = showPageBtn;
                                } else {
                                    $scope.showPageBtn = [1];
                                }
                            }
                        });

                        $scope.rowsSelectList = rowsSelectList;

                        $templateRequest(MyConstants.FILE_URL + "/js/core/directive/table/table-page.html" + "?vid=" + MyConstants.VERSION).then(function (tablePageHtml) {
                            var tablePage = $compile(tablePageHtml)($scope);
                            element.append(tablePage);
                        });
                    } else {
                        if ($scope.jyaAutoQuery !== "false") {
                            $scope.query();
                        }
                    }

                    //需要一个按钮 必须开启了分页才有地方放这个按钮 没地方放了
                    if ($scope.jyDataComparison && $scope.jyaHidePage !== "true") {
                        $scope.dataComparisonList = [];
                        $scope.deleteDataComparison = function (data) {
                            $scope.dataComparisonList.splice($scope.dataComparisonList.indexOf(data), 1);
                            $scope.dataComparisonChange();
                        };
                        var running2 = false;
                        $scope.dataComparisonClick = function () {
                            if (running2 || !$scope.dataComparison) {
                                return;
                            }
                            running2 = true;
                            $scope.openDataComparison = !$scope.openDataComparison;

                            $scope.dataComparison.animate({
                                width: "toggle",
                                opacity: "toggle"
                            }, 500, function () {
                                running2 = false;
                            });
                        };
                        var bodyTableTbody = bodyTable.find("tbody:eq(0)");
                        var getClickData = function (element) {
                            if (element == null || element.length == 0 || element[0] === document) {
                                return null;
                            }
                            if (element.get(0).tagName.toLocaleLowerCase() == "tr") {
                                var index = bodyTableTbody.children().index(element);
                                if (index >= 0 && index < $scope.jyPageData.content.length) {
                                    return $scope.jyPageData.content[index];
                                }
                                return null;
                            }
                            element = element.parent();
                            return getClickData(element);
                        };

                        bodyTable.click(function (event) {
                            $scope.$apply(function () {
                                if ($scope.openDataComparison && $scope.jyPageData && $scope.jyPageData.content) {
                                    var selectedData = getClickData($(event.target));
                                    var exist = false;
                                    tools.each($scope.dataComparisonList, function (data) {
                                        if (data[$scope.jyaDataComparisonKey] === selectedData[$scope.jyaDataComparisonKey]) {
                                            exist = true;
                                            $scope.dataComparisonList.splice($scope.dataComparisonList.indexOf(data), 1);
                                            return false;
                                        }
                                    });
                                    if (!exist) {
                                        $scope.dataComparisonList.push(angular.copy(selectedData));
                                    }
                                    $scope.dataComparisonChange();
                                }
                            });
                        });

                        $scope.onlyDiff = userConfig.get(userConfig.constants.TABLE_ONLY_DIFF);
                        $scope.dataComparisonChange = function () {
                            userConfig.save(userConfig.constants.TABLE_ONLY_DIFF, $scope.onlyDiff);
                            tools.each($scope.jyDataComparison, function (item) {
                                var lastData = null;
                                item.diff = false;
                                tools.each($scope.dataComparisonList, function (data) {
                                    if (!lastData) {
                                        lastData = data;
                                    } else if (lastData[item.data] !== data[item.data]) {
                                        lastData = data;
                                        item.diff = true;
                                        return false;
                                    }
                                });
                            });
                        };

                        var dataComparisonButton = $compile("<button class='btn btn-default' ng-click='dataComparisonClick()'>" +
                        "<span class='icon-list-alt'></span>{{openDataComparison?'关闭':'开启'}}数据比对" +
                        "</button>")($scope);
                        var buttonBox = element.find(".button-box");
                        if (buttonBox.length > 0) {
                            buttonBox.append(dataComparisonButton);
                        } else {
                            dataComparisonButton.css({
                                "position": "absolute",
                                "left": "5px",
                                "bottom": "5px",
                                "height": "31px",
                                "padding": "5px 12px"
                            });
                            element.append(dataComparisonButton);
                        }

                        $templateRequest(MyConstants.FILE_URL + "/js/core/directive/table/table-data-comparison.html" + "?vid=" + MyConstants.VERSION).then(function (tableDataComparisonHtml) {
                            $scope.dataComparison = $compile(tableDataComparisonHtml)($scope);
                            $scope.dataComparison.hide();
                            element.append($scope.dataComparison);
                            windowResize.addHandlerAndDestroy(function () {
                                $scope.dataComparison.css("max-width", element.width() * 0.7);
                            });
                        });
                    }
                }
            };
        }
    ]);
});