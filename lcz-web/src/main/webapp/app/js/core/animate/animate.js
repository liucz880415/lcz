"use strict";
define(["main-app"], function (app) {
    app.animation(".view-slide-in", function () {
        return {
            enter: function (element, done) {
                element.css({
                    opacity: 0
                }).animate({
                    opacity: 1
                }, 300, done);
            }
        };
    });

    app.animation(".repeat-animation", function () {
        return {
            enter: function (element, done) {
                element.css({
                    opacity: 0
                }).animate({
                    opacity: 1
                }, 300, done);
            },
            leave: function (element, done) {
                element.css({
                    opacity: 0
                });
                done();
            }
        };
    });

    app.animation(".hide-animation", function () {
        return {
            beforeAddClass: function (element, className, done) {
                if (className === "ng-hide") {
                    element.css({
                        opacity: 1
                    }).animate({
                        opacity: 0
                    }, 300, done);
                } else {
                    done();
                }
            },
            removeClass: function (element, className, done) {
                if (className === "ng-hide") {
                    element.css({
                        opacity: 0
                    }).animate({
                        opacity: 1
                    }, 300, done);
                } else {
                    done();
                }
            }
        };
    });

    //隐藏时不出现动画 避免两个本该互斥的节点同时存在导致的布局问题
    app.animation(".hide-animation2", [function () {
        return {
            beforeAddClass: function (element, className, done) {
                done();
            },
            removeClass: function (element, className, done) {
                if (className === "ng-hide") {
                    element.css({
                        opacity: 0
                    }).animate({
                        opacity: 1
                    }, 300, function () {
                        done();
                    });
                } else {
                    done();
                }
            }
        };
    }]);


    app.animation(".slide-up-down", function () {
        return {
            beforeAddClass: function (element, className, done) {
                if (className === "ng-hide") {
                    element.animate({
                        height: "toggle",
                        opacity: "toggle"
                    }, 300, done);
                } else {
                    done();
                }
            },
            removeClass: function (element, className, done) {
                if (className === "ng-hide") {
                    element.animate({
                        height: "toggle",
                        opacity: "toggle"
                    }, 300, done);
                } else {
                    done();
                }
            }
        };
    });

});