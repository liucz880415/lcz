/**
 * Created by Jannsen on 2016/11/11.
 */
"use strict";
var MyConstants = MyConstants || {};
(function () {
    //全局路径设置
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var localhostPath = curWwwPath.substring(0, pos);
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

    //文件所在的绝对路径 访问静态资源文件的时候使用此路径
    MyConstants.FILE_URL = localhostPath + projectName + "/app";

    //服务器所在的绝对路径 发get、post请求使用此路径
    MyConstants.BASE_URL = localhostPath + projectName;

    //服务器所在的绝对路径 发get、post请求使用此路径
    MyConstants.SERVER_NAME = projectName;

    //http调试
    MyConstants.HTTP_DEBUG = false;


    var cache = window.localStorage["CACHE"];
    var version = null;
    if (cache) {
        cache = JSON.parse(cache);
        version = cache["version"];
    }
    if (!version) {
        version = new Date().getTime() + "";
    }
    MyConstants.VERSION = version;

    MyConstants.BROWSER = function () {
        var agent = navigator.userAgent.toLowerCase(),
            opera = window.opera,
            browser = {
                //检测当前浏览器是否为IE
                ie: /(msie\s|trident.*rv:)([\w.]+)/.test(agent),
                //检测当前浏览器是否为Opera
                opera: (!!opera && opera.version),
                //检测当前浏览器是否是webkit内核的浏览器
                webkit: (agent.indexOf(' applewebkit/') > -1),
                //检测当前浏览器是否是运行在mac平台下
                mac: (agent.indexOf('macintosh') > -1),
                //检测当前浏览器是否处于“怪异模式”下
                quirks: (document.compatMode == 'BackCompat')
            };
        //检测当前浏览器内核是否是gecko内核
        browser.gecko = (navigator.product == 'Gecko' && !browser.webkit && !browser.opera && !browser.ie);
        var version = 0;
        // Internet Explorer 6.0+
        if (browser.ie) {
            var v1 = agent.match(/(?:msie\s([\w.]+))/);
            var v2 = agent.match(/(?:trident.*rv:([\w.]+))/);
            if (v1 && v2 && v1[1] && v2[1]) {
                version = Math.max(v1[1] * 1, v2[1] * 1);
            } else if (v1 && v1[1]) {
                version = v1[1] * 1;
            } else if (v2 && v2[1]) {
                version = v2[1] * 1;
            } else {
                version = 0;
            }
            //检测浏览器模式是否为 IE11 兼容模式
            browser.ie11Compat = document.documentMode == 11;
            //检测浏览器模式是否为 IE9 兼容模式
            browser.ie9Compat = document.documentMode == 9;
            //检测浏览器模式是否为 IE10 兼容模式
            browser.ie10Compat = document.documentMode == 10;
            //检测浏览器是否是IE8浏览器
            browser.ie8 = !!document.documentMode;
            //检测浏览器模式是否为 IE8 兼容模式
            browser.ie8Compat = document.documentMode == 8;
            //检测浏览器模式是否为 IE7 兼容模式
            browser.ie7Compat = ((version == 7 && !document.documentMode) || document.documentMode == 7);
            //检测浏览器模式是否为 IE6 模式 或者怪异模式
            browser.ie6Compat = (version < 7 || browser.quirks);
            browser.ie9above = version > 8;
            browser.ie9below = version < 9;
        }
        // Gecko.
        if (browser.gecko) {
            var geckoRelease = agent.match(/rv:([\d\.]+)/);
            if (geckoRelease) {
                geckoRelease = geckoRelease[1].split('.');
                version = geckoRelease[0] * 10000 + (geckoRelease[1] || 0) * 100 + (geckoRelease[2] || 0) * 1;
            }
        }
        //检测当前浏览器是否为Chrome, 如果是，则返回Chrome的大版本号
        if (/chrome\/(\d+\.\d)/i.test(agent)) {
            browser.chrome = +RegExp['\x241'];
        }
        //检测当前浏览器是否为Safari, 如果是，则返回Safari的大版本号
        if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)) {
            browser.safari = +(RegExp['\x241'] || RegExp['\x242']);
        }
        // Opera 9.50+
        if (browser.opera)
            version = parseFloat(opera.version());
        // WebKit 522+ (Safari 3+)
        if (browser.webkit)
            version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);
        //检测当前浏览器版本号
        browser.version = version;
        return browser;
    }();

    if (typeof(Worker) === "undefined" || MyConstants.BROWSER.ie) {
        alert("请不要使用IE和火狐，其他任何最新版浏览器都可以！");
        //window.location.href = MyConstant.BASE_URL + "/index/view/browser-download.jsp";
        return;
    }

    String.prototype.replaceAll = function (var1, var2) {
        var value = this;
        if (!value) {
            return value;
        }
        var old = "";
        while (old != value) {
            old = value;
            value = value.replace(var1, var2);
        }
        return value;
    };
})();