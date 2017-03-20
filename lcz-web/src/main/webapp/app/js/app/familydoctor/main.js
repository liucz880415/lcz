"use strict";
require.config({
    paths: {
        "tools": "../../core/util/tools",
        "main-app": "../../core/main-app",
        "common-module": "../../core/common-module",
        "jquery": "../../plugins/jQuery/dist/jquery.min",
        "angular": "../../plugins/angular/angular.min",
        "angular-route": "../../plugins/angular-route/angular-route.min",
        "angular-animate": "../../plugins/angular-animate/angular-animate.min",
        "angular-ui-mask": "../../plugins/angular-ui-mask/dist/mask.min",
        "jquery-mousewheel": "../../plugins/jquery-mousewheel/jquery.mousewheel.min",
        "core": "../../core"
    },
    shim: {
        "angular": {
            deps: ["jquery"],
            exports: "angular"
        },
        "angular-route": {
            deps: ["angular"]
        },
        "angular-animate": {
            deps: ["angular"]
        },
        "angular-ui-mask": {
            deps: ["angular"]
        },
        "jquery-mousewheel": {
            deps: ["jquery"]
        }
    },
    urlArgs: "version=1.0.0"
});

require(["angular", "main-module"], function (angular) {
    angular.bootstrap(document, ["jianyi"]);
});
