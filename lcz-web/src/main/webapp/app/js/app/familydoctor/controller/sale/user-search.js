"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("UserSearchController", ["$scope", "http",
        function ($scope, http) {
            $scope.users = [];
            $scope.queryUser = function () {
                if(!$scope.userName&&!$scope.mobile)
                {
                    tools.alert("手机和电话号不能都为空");
                }else{
                    http.post({
                        url: "/user/user.do",
                        data: {
                            userName: $scope.userName,
                            mobile: $scope.mobile
                        },
                        success: function (data) {
                            $scope.users = data;
                        }
                    })
                }

            };
            $scope.cardList = [];
            $scope.param={
                userId:"",
                userName:"",
                mobile:""
            };
            $scope.queryList2 = function (item) {
                $scope.param.userId = item.userId;
                $scope.param.userName = item.userName;
                $scope.param.mobile = item.mobile;
                $scope.executeQuery = true;
            };

            $scope.queryList = function () {
                http.post({
                    url: "/user/userCard.do",
                    data: $scope.param,
                    success: function (data) {
                        $scope.cardList = data;
                    }
                });
            };

            $scope.changeStatus = function(item){
                $scope.cardNo = item.cardNo;
                    http.post({
                        url:"/card/cardStatus.do",
                        data:{cardNo:$scope.cardNo},
                        success:function(data){
                            $scope.executeQuery = true;
                            tools.alert("作废成功");
                        }
                    })
            }
        }
    ]);
});