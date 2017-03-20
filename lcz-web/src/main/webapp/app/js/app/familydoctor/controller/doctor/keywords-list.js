"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("KeyWordsController", ["$scope", "http", "enumData", "fecha", "modal",
        function ($scope, http, enumData, fecha, modal) {

            $scope.addNewKeywords = function (event) {
                modal.open({
                    url: "keywords",
                    relatedButton: event.currentTarget,
                    controller: "AddKeywordsController",
                    close: function (data) {
                        $scope.queryKeywords();
                    }
                });
            };

            $scope.param = {
                originalKey: "",
                replaceKey: ""
            };

            $scope.queryKeywords = function () {
                http.post({
                    url: "/keywords/queryKeywords.do",
                    data: $scope.param,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                });
            };

            $scope.updateKeyword = function (keyword, event) {
                modal.open({
                    url: "keywords",
                    relatedButton: event.currentTarget,
                    data: keyword,
                    controller: "UpdateKeywordsController",
                    close: function (data) {
                        $scope.queryKeywords();
                    }
                });
            };

            $scope.deleteKeyword = function (id, event) {
                tools.alert("确定要删除吗？", {
                    "确定": function () {
                        http.post({
                            url: "/keywords/deleteKeyword.do?id=" + id,
                            relatedButton: event.currentTarget,
                            success: function (data) {
                                $scope.queryKeywords();
                            }
                        });
                    },
                    "取消": angular.noop
                });

            };

        }
    ]);

    app.controller("AddKeywordsController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.keyword = {};
        $scope.title = "新增关键词";

        $scope.save = function (event) {
            if (!$scope.keyword.originalKey) {
                tools.alert("原关键词不能为空");
                return;
            }
            if (!$scope.keyword.replaceKey) {
                tools.alert("替换关键词不能为空");
                return;
            }
            http.post({
                url: "/keywords/saveKeyword.do",
                relatedButton: event.currentTarget,
                data: $scope.keyword,
                success: function (data) {
                    $scope.close(true);
                }
            });
        };

    }]);

    app.controller("UpdateKeywordsController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.keyword = $scope.data;
        $scope.title = "修改关键词";
        var oldKeyword = angular.copy($scope.keyword);
        $scope.save = function (event) {
            if (!$scope.keyword.originalKey) {
                tools.alert("原关键词不能为空");
                return;
            }
            if (!$scope.keyword.replaceKey) {
                tools.alert("替换关键词不能为空");
                return;
            }
            if (oldKeyword.originalKey === $scope.keyword.originalKey && $scope.keyword.replaceKey === oldKeyword.replaceKey) {
                $scope.close(true);
                return;
            }
            http.post({
                url: "/keywords/updateKeyword.do",
                relatedButton: event.currentTarget,
                data: $scope.keyword,
                success: function (data) {
                    $scope.close(true);
                }
            });
        };
    }]);

});