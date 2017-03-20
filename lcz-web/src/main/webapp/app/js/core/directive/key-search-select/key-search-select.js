"use strict";
define(["main-app", "tools"], function (app, tools) {
    app.directive("keySearchSelect", ["$rootScope", "$sce", "$templateRequest", "$compile", "$timeout", "destroy", "cache", "windowResize", "http",
        function ($rootScope, $sce, $templateRequest, $compile, $timeout, destroy, cache, windowResize, http) {
            return {
                scope: {
                    jySelectedItem: "=?",//选中的数据
                    jyaKeys: "@",//查询的Key 用,号隔开
                    jyaUrl: "@",//请求的URL
                    jyaPlaceholder: "@",//placeholder
                    jyaWidth: "@",
                    jyDisabled: "=?",//禁用
                    jyfCallBack: "&",//选中后的回调函数
                    jyaSelectedLabel: "@",//选中显示的数据
                    jyaPosition: "@",
                    jyaLineSize: "@",//显示行数 默认五行
                    jyaLineHeight: "@"//行高
                    //示例
                    //<key-search-select>
                    //        允许定义样式
                    //        <span style="">${mobileNo}</span>
                    //        <span style="">${username}</span>
                    //</key-search-select>
                },
                restrict: 'E',
                template: "",
                link: function ($scope, element) {
                    var liTemplateHtml = element.html();
                    element.html("");

                    $templateRequest(MyConstants.FILE_URL + "/js/core/directive/key-search-select/key-search-select.html?vid=" + MyConstants.VERSION).then(function (html) {
                        element.append($compile(html)($scope));

                        $scope.keys = $scope.jyaKeys.split(",");
                        $scope.focusIn = false;
                        $scope.showSelectorBox = false;

                        $scope.getLi = function (item) {
                            var html = liTemplateHtml;
                            for (var key in item) {
                                html = html.replaceAll("${" + key + "}", tools.getString(item[key]));
                            }
                            return $sce.trustAsHtml(html);
                        };

                        var getSelectedLabel = function (item) {
                            if (!item) {
                                return "";
                            }
                            var html = $scope.jyaSelectedLabel;
                            for (var key in item) {
                                html = html.replaceAll("${" + key + "}", tools.getString(item[key]));
                            }
                            return html;
                        };

                        var getCache = function (key) {
                            return cache.getAutoDestroyData(cache.constants.KEY_SEARCH + $scope.jyaUrl, key);
                        };

                        var addCache = function (key, value) {
                            cache.addAutoDestroyData(cache.constants.KEY_SEARCH + $scope.jyaUrl, key, value);
                            if (value.length == 0) {
                                var allNullKey = getAllNullKey();
                                if (!allNullKey) {
                                    allNullKey = [];
                                }
                                allNullKey.push(key);
                                cache.addAutoDestroyData(cache.constants.KEY_SEARCH + $scope.jyaUrl, "allNullKey" + $scope.eventId, allNullKey);
                            }
                        };

                        var getAllKey = function () {
                            return cache.getAutoDestroyAllKey(cache.constants.KEY_SEARCH + $scope.jyaUrl);
                        };

                        var getAllNullKey = function () {
                            var allNullKey = getCache("allNullKey" + $scope.eventId);
                            if (!allNullKey) {
                                allNullKey = [];
                            }
                            return allNullKey;
                        };

                        var input = element.find("input");
                        var fixedBox = element.find(".fixed-box");
                        var selectorBox = element.find(".selector-box");
                        $scope.eventId = Math.random().toString().replace(".", "");
                        element.addClass("key-search-select" + $scope.eventId);

                        var fixedBoxPosition = function () {
                            tools.inputBoxPosition(fixedBox, input, $scope.jyaPosition);
                        };
                        windowResize.addHandlerAndDestroy(fixedBoxPosition);

                        var viewHide = function (apply) {
                            $(document).off("click.key-search-select" + $scope.eventId);
                            var applyHandler = function () {
                                $scope.focusIn = false;
                                $scope.showSelectorBox = false;
                                input.blur();
                                var inputVal = input.val();
                                var clearData = function () {
                                    input.val("");
                                    if ($scope.jySelectedItem != null) {
                                        $timeout(function () {
                                            $scope.jyfCallBack()
                                        }, 50);
                                    }
                                    $scope.jySelectedItem = null;
                                };

                                if (inputVal) {
                                    if (inputVal != getSelectedLabel($scope.jySelectedItem)) {
                                        var dataHandler = function (data) {
                                            for (var i = 0; i < data.length; i++) {
                                                var item = data[i];
                                                if (inputVal === getSelectedLabel(item)) {
                                                    $scope.select(item);
                                                    return;
                                                }
                                            }
                                            tools.timerAlert("未查找到对应数据！");
                                            input.val("");
                                            clearData();
                                        };
                                        var cacheData = getCache(inputVal);
                                        if (cacheData) {
                                            dataHandler(cacheData);
                                        } else {
                                            http.get({
                                                url: MyConstants.BASE_URL + "/" + $scope.jyaUrl,
                                                params: {
                                                    key: inputVal
                                                },
                                                success: function (data) {
                                                    addCache(inputVal, data);
                                                    dataHandler(data);
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    clearData();
                                }
                            };
                            if (apply) {
                                $scope.$apply(applyHandler);
                            } else {
                                applyHandler();
                            }
                        };

                        $scope.$on("focusUniqueView", function (event, eventId) {
                            if ($scope.focusIn && $scope.eventId != eventId) {
                                viewHide(false);
                            }
                        });

                        $scope.inputFocus = function () {
                            if ($scope.focusIn || $scope.jyDisabled) {
                                return;
                            }
                            $rootScope.$broadcast("focusUniqueView", $scope.eventId);

                            $(document).on("click.key-search-select" + $scope.eventId, function (event) {
                                if (!($(event.target).closest("[jy-event-id='" + $scope.eventId + "']").length > 0) && !($(event.target).closest(".key-search-select" + $scope.eventId).length > 0)) {
                                    viewHide(true);
                                }
                            });
                            $scope.focusIn = true;
                            $scope.showSelectorBox = !input.val();
                            $scope.content = [];
                            fixedBoxPosition();
                        };

                        var lastCriteria;
                        var searchId;
                        $scope.searchTimer = null;
                        $scope.inputKeyup = function (event) {
                            if (event && (event.keyCode === 13 || event.keyCode === 38 || event.keyCode === 40)) {
                                return;
                            }
                            var inputVal = input.val();
                            inputVal = inputVal.trim();

                            if (lastCriteria && inputVal == lastCriteria) {
                                return;
                            }
                            lastCriteria = inputVal;
                            if ($scope.searchTimer) {
                                $timeout.cancel($scope.searchTimer);
                                $scope.searchTimer = null;
                            }

                            if (inputVal && $scope.selectedLabel === inputVal) {
                                $scope.showSelectorBox = false;
                                return;
                            }
                            $scope.showSelectorBox = true;
                            $scope.selectedLabel = "";
                            $scope.selectedIndex = -1;

                            searchId = Math.random().toString().replace(".", "");
                            var currentSearchId = searchId;
                            if (inputVal) {
                                var dataHandler = function (data) {
                                    if (currentSearchId == searchId) {
                                        $scope.searchTimer = null;
                                        $scope.content = data;
                                    }
                                };
                                var cacheData = getCache(input.val());
                                if (cacheData) {
                                    dataHandler(cacheData);
                                } else {
                                    var allNullKey = getAllNullKey();
                                    for (var i = 0; i < allNullKey.length; i++) {
                                        if (inputVal.indexOf(allNullKey[i]) > -1) {
                                            dataHandler([]);
                                            return;
                                        }
                                    }
                                    tools.each(allNullKey, function (nullKey) {
                                        if (inputVal.indexOf(nullKey) > -1) {
                                            return false;
                                        }
                                    });

                                    var keyArray = getAllKey();
                                    var filterKey = "";
                                    tools.each(keyArray, function (key) {
                                        if (inputVal.indexOf(key) > -1 && key.length > filterKey.length) {
                                            filterKey = key;
                                            return false;
                                        }
                                    });
                                    if (filterKey) {
                                        var filterData = getCache(filterKey);
                                        if (filterData.length < 20) {
                                            var newData = angular.copy(filterData);
                                            var removeArray = [];
                                            tools.each(newData, function (item) {
                                                tools.each($scope.keys, function (key) {
                                                    if (item[key].indexOf(inputVal) < 0) {
                                                        removeArray.push(item);
                                                        return false;
                                                    }
                                                });
                                            });
                                            tools.each(removeArray, function (item) {
                                                newData.splice(newData.indexOf(item), 1);
                                            });
                                            dataHandler(newData);
                                            return;
                                        }
                                    }
                                    $scope.searchTimer = $timeout(function () {
                                        http.get({
                                            url: MyConstants.BASE_URL + "/" + $scope.jyaUrl,
                                            params: {
                                                key: inputVal
                                            },
                                            success: function (data) {
                                                addCache(input.val(), data);
                                                dataHandler(data);
                                            }
                                        });
                                    }, 500);
                                }
                            } else {
                                $scope.searchTimer = null;
                                $scope.content = [];
                            }
                        };

                        var lineSize = tools.getInt($scope.jyaLineSize, 5);
                        var lineHeight = tools.getInt($scope.jyaLineHeight, 40);
                        var selectorBoxHeight = lineSize * lineHeight;
                        selectorBox.height(selectorBoxHeight);
                        element.find(".data-loading,.data-message").css({
                            "height": selectorBoxHeight - 2,
                            "line-height": selectorBoxHeight - 2 + "px"
                        });

                        var calculateScroll = function () {
                            var target = selectorBox.scrollTop() + selectorBoxHeight - lineHeight;
                            var rangeBegin = $scope.selectedIndex * lineHeight;
                            var rangeEnd = rangeBegin + selectorBoxHeight - lineHeight;

                            var targetTop;
                            if (target < rangeBegin) {
                                targetTop = rangeBegin - (lineSize - 1) * lineHeight;
                            } else if (target > rangeEnd) {
                                targetTop = rangeBegin;
                            } else {
                                return;
                            }
                            selectorBox.stop(true, true);
                            selectorBox.animate({scrollTop: targetTop}, 100, "swing");
                        };

                        $scope.inputKeydown = function (event) {
                            if (!$scope.content || $scope.content.length === 0) {
                                return;
                            }
                            if (event.keyCode === 38) {
                                if ($scope.selectedIndex <= 0) {
                                    $scope.selectedIndex = $scope.content.length - 1;
                                } else {
                                    $scope.selectedIndex--;
                                }
                                calculateScroll();
                            } else if (event.keyCode === 40) {
                                if ($scope.selectedIndex >= $scope.content.length - 1) {
                                    $scope.selectedIndex = 0;
                                } else {
                                    $scope.selectedIndex++;
                                }
                                calculateScroll();
                            } else if (event.keyCode === 13) {
                                if ($scope.selectedIndex === -1) {
                                    return;
                                }
                                $scope.select($scope.content[$scope.selectedIndex]);
                                $scope.selectedIndex = -1;
                            } else {
                                return;
                            }
                            event.preventDefault();
                        };

                        $scope.select = function (item) {
                            $scope.jySelectedItem = item;
                            input.val(getSelectedLabel(item));
                            viewHide(false);
                            $timeout(function () {
                                $scope.jyfCallBack()
                            }, 10);
                        };

                        $scope.$watch("jySelectedItem", function (jySelectedItem) {
                            if (!$scope.focusIn) {
                                input.val(getSelectedLabel(jySelectedItem));
                            }
                        });

                        $scope.iconClick = function () {
                            input.focus();
                        };
                    });
                }
            };
        }
    ]);
});