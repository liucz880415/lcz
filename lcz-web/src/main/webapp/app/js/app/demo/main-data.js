"use strict";
define([], function () {
    return {
        index: "style.button",
        module: "demo",
        alias: {},
        bodyClass: {},
        nav: ["$q", function ($q) {
            var deferred = $q.defer();
            var navData = [{
                name: "示例",
                nav: [{
                    name: "样式",
                    nav: [{
                        name: "按钮",
                        path: "style.button"
                    }, {
                        name: "页签",
                        path: "style.tab"
                    }]
                }, {
                    name: "组件",
                    nav: [{
                        name: "提示框",
                        path: "components.alert"
                    }, {
                        name: "模态框",
                        path: "components.modal"
                    }, {
                        name: "表格",
                        path: "components.table"
                    }, {
                        name: "日期",
                        path: "components.datetime-picker"
                    }, {
                        name: "图片",
                        path: "components.image"
                    }, {
                        name: "查询下拉框",
                        path: "components.key-search-select"
                    }]
                }]
            }];
            deferred.resolve(navData);
            return deferred.promise;
        }]
    };
});