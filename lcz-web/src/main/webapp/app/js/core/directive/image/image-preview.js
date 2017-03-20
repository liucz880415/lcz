"use strict";
define(["main-app", "tools"], function (app, tools) {
    app.directive("imagePreview", ["destroy", "escKeydown",
        function (destroy, escKeydown) {
            return {
                scope: {
                    jyId: "=?",//通过文件ID访问的图片配置这个参数 暂时没开发 有需要找我
                    jyaSrc: "@",//图片绝对路径
                    jyWidth: "=?",//宽度
                    jyHeight: "=?"//高度
                },
                restrict: 'E',
                templateUrl: MyConstants.FILE_URL + "/js/core/directive/image/image-preview.html?vid=" + MyConstants.VERSION,
                link: function ($scope, element) {
                    var escCloseInterface = {
                        close: null
                    };

                    var $preview = element.find(".image-preview-overlay");
                    $scope.imgError = false;
                    element.find("img").on("error", function () {
                        $scope.$apply(function () {
                            $scope.imgError = true;
                        });
                    });
                    $scope.$watch("jyaSrc", function (jyaSrc) {
                        $scope.imgError = false;
                    });
                    $scope.$watch("jyId", function (jyId) {
                        $scope.imgError = false;
                        if (!$scope.jyaSrc || $scope.jyaSrc.indexOf("file/get.do?fileId") > -1) {
                            $scope.jyaSrc = MyConstants.BASE_URL + "/file/get.do?fileId=" + jyId;
                        }
                    });

                    var indexBody = $(".index-body");
                    $scope.close = function () {
                        $preview.animate({
                            top: element.offset().top,
                            left: element.offset().left,
                            width: $scope.jyWidth,
                            height: $scope.jyHeight,
                            opacity: 0.5
                        }, 500, "swing", function () {
                            $preview.hide();
                            indexBody.css("overflow", "overlay");
                        });
                        escKeydown.imagePreviewArray.splice(escKeydown.imagePreviewArray.indexOf(escCloseInterface), 1);
                    };
                    escCloseInterface.close = $scope.close;

                    $scope.imageClick = function (event) {
                        if (event.target.tagName !== "IMG") {
                            $scope.close();
                        }
                    };

                    $scope.open = function () {
                        escKeydown.imagePreviewArray.push(escCloseInterface);
                        indexBody.css("overflow", "initial");
                        $preview.css({
                            "top": element.offset().top,
                            "left": element.offset().left,
                            "width": $scope.jyWidth,
                            "height": $scope.jyHeight,
                            "opacity": 0.5
                        });
                        $preview.show();
                        $preview.animate({
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 1
                        }, 500, "swing");
                        $preview.focus();
                    };

                    var height = 100;
                    var $previewImg = $preview.find("img");
                    $preview.mousewheel(function (event) {
                        if (event.deltaY > 0) {
                            height -= 15;
                        } else if (event.deltaY < 0) {
                            height += 15;
                        }
                        $previewImg.css("height", height + "%");
                        event.preventDefault();
                    });
                }
            };
        }
    ]);
});