/**
 * Created by Jannsen on 2015/11/13.
 */
"use strict";
define(["main-app"], function (app) {
    app.factory("storage", ["$q",
        function ($q) {
            var constants = {
                USER_CONFIG: "USER_CONFIG",
                MANAGE_USER_LOGIN_MESSAGE: "MANAGE_USER_LOGIN_MESSAGE"
            };

            var getSessionStorage = function (id) {
                if (window.sessionStorage) {
                    return window.sessionStorage[id];
                }
                return null;
            };

            var getSessionStorageObject = function (id) {
                var value = getSessionStorage(id);
                if (value != null && value != undefined) {
                    return JSON.parse(value);
                }
                return null;
            };

            var setSessionStorage = function (id, value) {
                if (window.sessionStorage) {
                    window.sessionStorage[id] = value;
                }
            };

            var setSessionStorageObject = function (id, value) {
                if (value) {
                    value = JSON.stringify(value);
                }
                setSessionStorage(id, value);
            };

            var clearSessionStorage = function (id) {
                if (window.sessionStorage) {
                    delete window.sessionStorage[id];
                }
            };

            var getLocalStorage = function (id) {
                if (window.localStorage) {
                    return window.localStorage[id];
                }
                return null;
            };

            var getLocalStorageObject = function (id, defaultValue) {
                var value = getLocalStorage(id);
                if (value != null && value != undefined) {
                    return JSON.parse(value);
                } else {
                    return defaultValue === undefined ? null : defaultValue;
                }
            };

            var getLocalStorageOrOtherObject = function (id, otherFunc, callBack, always) {
                var data = getLocalStorageObject(id);
                var execute = function () {
                    var deferred = $q.defer();
                    otherFunc(deferred);
                    deferred.promise.then(function (data) {
                        setLocalStorageObject(id, data);
                        callBack(data);
                    });
                };
                if (data == null) {
                    execute();
                } else {
                    callBack(data);
                    if (always) {
                        execute();
                    }
                }
            };

            var setLocalStorage = function (id, value) {
                if (window.localStorage) {
                    window.localStorage[id] = value;
                }
            };

            var setLocalStorageObject = function (id, value) {
                if (value) {
                    value = JSON.stringify(value);
                }
                setLocalStorage(id, value);
            };

            var clearLocalStorage = function (id) {
                if (window.localStorage) {
                    delete window.localStorage[id];
                }
            };

            return {
                constants: constants,
                getSessionStorage: getSessionStorage,
                getSessionStorageObject: getSessionStorageObject,
                setSessionStorage: setSessionStorage,
                setSessionStorageObject: setSessionStorageObject,
                clearSessionStorage: clearSessionStorage,
                getLocalStorage: getLocalStorage,
                getLocalStorageObject: getLocalStorageObject,
                setLocalStorage: setLocalStorage,
                setLocalStorageObject: setLocalStorageObject,
                getLocalStorageOrOtherObject: getLocalStorageOrOtherObject,
                clearLocalStorage: clearLocalStorage
            };
        }
    ]);
});