"use strict";
define(["main-app", "jquery"], function (app, $) {

    app.directive("noBindLimitSpan", [
        function () {
            return {
                scope: {
                    jyaText: "@",
                    jyaMaxWidth: "@"
                },
                restrict: "E",
                template: "<span title=\"{{::jyaText && jyaText.length &gt; limit ? jyaText:''}}\">" +
                "{{:: jyaText | limitTo:limit}}" +
                "{{:: jyaText && jyaText.length &gt; limit?'...':''}}" +
                "</span>",
                replace: true,
                link: function ($scope, element, attributes) {
                    var fontSize = element.css("fontSize");
                    fontSize = fontSize ? fontSize.replace("px", "") : fontSize;
                    fontSize = parseInt(fontSize);

                    var maxWidth = parseInt($scope.jyaMaxWidth);
                    $scope.limit = $scope.jyaText ? $scope.jyaText.getMaxWidthLimit(fontSize, maxWidth) : 0;
                }
            };
        }
    ]);
});