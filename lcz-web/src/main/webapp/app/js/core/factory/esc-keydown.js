"use strict";
define(["main-app"], function (app) {

    app.factory("escKeydown", [function () {
        var modalArray = [];
        var imagePreviewArray = [];
        $(window).keydown(function (event) {
            if (event.keyCode == 27) {
                console.log(event.keyCode);
                var closeInterface = null;
                if (imagePreviewArray.length > 0) {
                    closeInterface = imagePreviewArray[imagePreviewArray.length - 1];
                } else if (modalArray.length > 0) {
                    closeInterface = modalArray[modalArray.length - 1];
                }
                try {
                    closeInterface.close();
                } catch (e) {
                }
            }
        });
        return {
            modalArray: modalArray,
            imagePreviewArray: imagePreviewArray
        };
    }]);
});