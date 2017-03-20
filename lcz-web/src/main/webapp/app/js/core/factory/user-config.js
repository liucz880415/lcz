/**
 * Created by Jannsen on 2015/11/13.
 */
"use strict";
define(["main-app", "tools"], function (app, tools) {
    app.factory("userConfig", ["http", "storage",
        function (http, storage) {
            var constants = {
                USER_ID: "userId",//用户ID
                USER_NAME: "userName",//用户姓名
                ENUM_DATA: "enumData",//下拉框数据
                TABLE_ONLY_DIFF:"tableOnlyDiff",
                TABLE_ROWS: "tableRows"//表格默认条数
            };

            /**
             * 比对数据是否一致 一致则不更新
             * @type {string[]}
             */
            var matchingKey = ["tableRows"];

            var userConfig;
            var get = function (id, defaultValue, noReload) {
                if (userConfig == null) {
                    userConfig = storage.getLocalStorageObject(storage.constants.USER_CONFIG);
                    if (userConfig == null) {
                        if (noReload) {
                            return true;
                        }
                        refresh(true);
                        return null;
                    }
                }
                var _userConfig = angular.copy(userConfig);
                var data = _userConfig[id];
                return (data !== null && data !== undefined) ? data : defaultValue;
            };

            var set = function (id, value) {
                userConfig[id] = value;
                storage.setLocalStorageObject(storage.constants.USER_CONFIG, userConfig);
            };

            var save = function (id, value, relatedButton, reload, callBack, relatedButtonText) {
                if (userConfig == null) {
                    userConfig = storage.getLocalStorageObject(storage.constants.USER_CONFIG);
                    if (userConfig == null) {
                        return;
                    }
                }
                if (matchingKey.indexOf(id) > -1) {
                    if (userConfig[id] === value) {
                        return;
                    }
                }
                userConfig[id] = value;
                storage.setLocalStorageObject(storage.constants.USER_CONFIG, userConfig);
                var sendData = {};
                sendData[id] = value;
                http.post({
                    url: "user/saveUserConfig.do?id=" + id,
                    relatedButton: relatedButton,
                    relatedButtonText: relatedButtonText ? relatedButtonText : "请求中",
                    data: sendData,
                    success: function () {
                        if (reload) {
                            window.location.reload();
                        }
                        callBack && callBack();
                    }
                });
            };

            var refresh = function (reload, callback) {
                http.get({
                    url: "user/findUserConfig.do",
                    success: function (data) {
                        storage.setLocalStorageObject(storage.constants.USER_CONFIG, data);
                        userConfig = storage.getLocalStorageObject(storage.constants.USER_CONFIG);
                        reload && window.location.reload();
                        callback && callback();
                    }
                });
            };

            return {
                constants: constants,
                get: get,
                set: set,//不提交数据
                save: save,
                refresh: refresh
            };
        }
    ]);
});