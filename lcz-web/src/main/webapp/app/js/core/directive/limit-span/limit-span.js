"use strict";
define(["main-app", "jquery"], function (app, $) {

    app.directive("limitSpan", [
        function () {
            return {
                scope: {
                    jyText: "=",
                    jyaMaxWidth: "@"
                },
                restrict: "E",
                template: "<span title=\"{{jyText && jyText.length &gt; limit ? jyText:''}}\">" +
                "{{jyText | limitTo:limit}}" +
                "{{jyText && jyText.length &gt; limit?'...':''}}" +
                "</span>",
                replace: true,
                link: function ($scope, element, attributes) {
                    var fontSize = element.css("fontSize");
                    fontSize = fontSize ? fontSize.replace("px", "") : fontSize;
                    fontSize = parseInt(fontSize);

                    var maxWidth = parseInt($scope.jyaMaxWidth);

                    $scope.$watch("jyText", function (text) {
                        $scope.limit = text ? text.getMaxWidthLimit(fontSize, maxWidth) : 0;
                    });
                }
            };
        }
    ]);
});