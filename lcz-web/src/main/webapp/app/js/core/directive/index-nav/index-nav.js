"use strict";

define(["main-app", "tools", "main-data"], function (app, tools, mainData) {
    app.directive("indexNav", ["$rootScope", "$location",
        function ($rootScope, $location) {
            return {
                restrict: 'E',
                templateUrl: MyConstants.FILE_URL + "/js/core/directive/index-nav/index-nav.html?vid=" + MyConstants.VERSION,
                link: function ($scope, element) {
                    var pathMap = {};
                    var lastSelectedItem = null;
                    $scope.change = function () {
                        var item = pathMap[$location.path().replace("\/", "")];
                        if (!item || item == lastSelectedItem) {
                            return;
                        }
                        item.selected = true;
                        document.title = item.title ? item.title : ("健医科技 - " + item.name);
                        if (lastSelectedItem) {
                            lastSelectedItem.selected = false;
                        }
                        lastSelectedItem = item;
                        if (item.parent) {
                            item.parent.expand = true;
                        }
                    };

                    var bindData = function (parent) {
                        tools.each(parent.nav, function (item) {
                            if (item.path) {
                                pathMap[item.path] = item;
                                tools.each(item["childrenPath"], function (child) {
                                    pathMap[child] = item;
                                });
                            } else {
                                bindData(item);
                                item.expand = true;
                            }
                            item.parent = parent;
                        });
                    };

                    $scope.fileUrl = MyConstants.FILE_URL;
                    $scope.selected = false;


                    var init = function () {
                        bindData({
                            nav: $scope.nav
                        });
                        $scope.change();
                    };
                    if (angular.isString(mainData.nav[0])) {
                        app.invoke(mainData.nav).then(function (nav) {
                            $scope.nav = nav;
                            init();
                        });
                    } else {
                        $scope.nav = mainData.nav;
                        init();
                    }

                    $scope.$on("routeChangeSuccess", function () {
                        $scope.change();
                    });

                    $scope.open = function (item) {
                        $location.path(item.path).search({});
                    };
                }
            };
        }
    ]);
});