"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("ChannelListController", ["$scope", "http", "modal",
        function ($scope, http, modal) {
            $scope.queryParams = {
                name: ""
            };

            $scope.query = function () {
                http.post({
                    url: "channel/channelList.do",
                    data: $scope.queryParams,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                });
            };

            $scope.editChannel = function (item, event) {
                modal.open({
                    url: "channel-detail",
                    relatedButton: event.currentTarget,
                    controller: "EditChannelController",
                    data: item,
                    close: function (data) {
                        $scope.query();
                    }
                })
            };

            $scope.code = function(item, event){
                modal.open({
                    url:"code",
                    relatedButton: event.currentTarget,
                    controller: "QrCodeController",
                    data:item,
                    close:function(data){
                        $scope.query();
                    }
                })
            };

            $scope.addChannel = function (event) {
                modal.open({
                    url: "channel-detail",
                    controller: "AddChannelController",
                    relatedButton: event.currentTarget,
                    close: function (data) {
                        $scope.query();
                    }
                })
            };

            $scope.updateChannelStatus = function (item, status, event) {
                http.post({
                    url: "channel/updateChannelStatus.do",
                    relatedButton: event.currentTarget,
                    data: {
                        channelId: item.id,
                        status: status
                    },
                    success: function (data) {
                        var message = "";
                        switch (status) {
                            case "ACTIVE":
                                message = "恢复";
                                break;
                            case "INACTIVE":
                                message = "停用";
                                break;
                        }
                        tools.timerAlert(message + "成功");
                        item.status = status;
                    }
                });
            };
        }
    ]);
    app.controller("QrCodeController",["$scope", "http",  function ($scope, http){
        $scope.channelId=$scope.data.id;
        $scope.channelName=$scope.data.name;
        $scope.title="二维码信息";
        http.post({
            url:"/channel/code.do",
            params:{channelId:$scope.channelId,
                channelName:$scope.channelName
            },
            success:function(data){
                $scope.codePath=MyConstants.BASE_URL +"/file/get.do?fileId="+data.value;
                $scope.path = data.value;
            }
        });
        $scope.download = function () {
            window.location.href = MyConstants.BASE_URL+"/channel/downloadCode.do?filePath="+$scope.path;
        }
    }]);
    app.controller("AddChannelController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.channelCategoryList = enumData.getList("ChannelCategory");
        $scope.channelStatusList = enumData.getList("ChannelStatus");
        $scope.title = "新增渠道";
        $scope.channel = {
            name: "",
            code: "",
            category: "",
            description: "",
            status: "",
            address: "",
            tel: ""
        };
        $scope.save = function (event) {
            http.post({
                url: "channel/addChannel.do",
                data: $scope.channel,
                relatedButton: event.currentTarget,
                success: function (data) {
                    if (data && data.value) {
                        $scope.close(true);
                    }
                }
            });
        }
    }]);

    app.controller("EditChannelController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.channelCategoryList = enumData.getList("ChannelCategory");
        $scope.channelStatusList = enumData.getList("ChannelStatus");
        $scope.title = "编辑渠道信息";
        $scope.channel = $scope.data;
        $scope.save = function (event) {
            http.post({
                url: "channel/updateChannel.do",
                data: $scope.channel,
                relatedButton: event.currentTarget,
                success: function (data) {
                    if (data && data.value) {
                        $scope.close(true);
                    }
                }
            });
        }
    }]);
})
;