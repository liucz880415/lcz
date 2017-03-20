"use strict";
define(["main-app", "jquery", "tools"
], function (app, $, tools) {
    app.controller("ProductListController", ["$scope", "http", "modal",
        function ($scope, http, modal) {
            $scope.queryParams = {
                name: ""
            };

            $scope.query = function () {
                http.post({
                    url: "productManage/productList.do",
                    data: $scope.queryParams,
                    success: function (data) {
                        $scope.pageData = data;
                    }
                });
            };

            $scope.editProduct = function (item, event) {
                modal.open({
                    url: "product-detail",
                    relatedButton: event.currentTarget,
                    controller: "EditProductController",
                    data: item,
                    close: function (data) {
                        $scope.query();
                    }
                })
            };

            $scope.offSale = function (id, event) {
                tools.alert("是否确认下架该产品？", function () {
                    http.post({
                        url: "",
                        relatedButton: event.currentTarget,
                        data: {
                            productId: id
                        },
                        success: function (data) {
                            tools.timerAlert("下架成功");
                        }
                    });
                }, angular.noop);

            };
            $scope.onSale = function (id, event) {

            };

            $scope.addProduct = function (event) {
                modal.open({
                    url: "product-detail",
                    controller: "AddProductController",
                    relatedButton: event.currentTarget,
                    close: function (data) {
                        $scope.query();
                    }
                })
            };

            $scope.updateProductStatus = function (item, status, event) {
                var message = status == 'ON_SALE' ? "上架" : "下架";
                tools.alert("是否确认" + message + "该产品？", function () {
                    http.post({
                        url: "productManage/updateProductStatus.do",
                        relatedButton: event.currentTarget,
                        data: {
                            productId: item.id,
                            status: status
                        },
                        success: function (data) {
                            tools.timerAlert(message + "成功");
                            item.status = status;

                        }
                    });
                }, angular.noop);
            };

            $scope.productDetail = function (id) {
                $scope.querySkuParams.productId = id;
                $scope.skuExecuteQuery = true;
            };

            $scope.querySkuParams = {
                productId: "",
                name: ""
            };
            $scope.querySku = function () {
                if (!$scope.querySkuParams.productId) {
                    $scope.skuPageData = {totalPages: 1, totalElements: 0, content: []};
                } else {
                    http.post({
                        url: "productManage/getProductSkuList.do",
                        data: $scope.querySkuParams,
                        success: function (data) {
                            $scope.skuPageData = data;
                        }
                    });
                }
            };
            $scope.addSku = function (id, event) {
                if (!id) {
                    tools.alert("主产品Id不能为空");
                    return;
                }
                modal.open({
                    url: "product-sku-detail",
                    relatedButton: event.currentTarget,
                    controller: "AddProductSkuController",
                    data: {
                        productId: id
                    },
                    close: function (data) {
                        $scope.querySku();
                    }
                })
            };
            $scope.editSku = function (item, event) {
                modal.open({
                    url: "product-sku-detail",
                    relatedButton: event.currentTarget,
                    controller: "EditProductSkuController",
                    data: item,
                    close: function (data) {
                        $scope.querySku();
                    }
                })
            };

            $scope.updateSkuStatus = function (item, status, event) {
                http.post({
                    url: "productManage/updateProductSkuStatus.do",
                    relatedButton: event.currentTarget,
                    data: {
                        skuId: item.id,
                        status: status
                    },
                    success: function (data) {
                        var message = "";
                        switch (status) {
                            case "STOP_SALE":
                                message = "设置停售";
                                break;
                            case "SALE_OUT":
                                message = "设置售罄";
                                break;
                            case "NORMAL":
                                message = "恢复正常";
                                break;
                        }
                        tools.timerAlert(message + "成功");
                        item.status = status;
                    }
                });
            };

        }
    ]);
    app.controller("EditProductController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.productCategoryList = enumData.getList("ProductCategory");
        $scope.productStatusList = enumData.getList("ProductStatus");
        $scope.title = "编辑产品信息";
        $scope.product = $scope.data;
        $scope.save = function (event) {
            http.post({
                url: "productManage/updateProductInfo.do",
                data: $scope.product,
                relatedButton: event.currentTarget,
                success: function (data) {
                    if (data && data.value) {
                        $scope.close(true);
                    }
                }
            });
        }
    }]);
    app.controller("AddProductController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.productCategoryList = enumData.getList("ProductCategory");
        $scope.productStatusList = enumData.getList("ProductStatus");
        $scope.title = "新增产品";
        $scope.product = {
            name: "",
            code: "",
            description: "",
            type: "",
            ProductStatus: "OFF_SALE",
            limitation: "",
            detail: ""
        };
        $scope.save = function (event) {
            http.post({
                url: "productManage/addProduct.do",
                data: $scope.product,
                relatedButton: event.currentTarget,
                success: function (data) {
                    if (data && data.value) {
                        $scope.close(true);
                    }
                }
            });
        }
    }
    ])
    ;
    app.controller("EditProductSkuController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.title = "编辑子产品";
        $scope.productSkuStatusList = enumData.getList("ProductSkuStatus");
        $scope.cardTypeList = enumData.getList("CardType");
        $scope.productSku = $scope.data;
        $scope.save = function (event) {
            http.post({
                url: "productManage/updateProductSku.do",
                data: $scope.productSku,
                relatedButton: event.currentTarget,
                success: function (data) {
                    if (data && data.value) {
                        $scope.close(true);
                    }
                }
            });
        }


    }]);
    app.controller("AddProductSkuController", ["$scope", "enumData", "http", function ($scope, enumData, http) {
        $scope.title = "新增子产品";
        if (!$scope.data.productId) {
            tools.alert("主产品Id不能为空");
            return;
        }
        $scope.productSkuStatusList = enumData.getList("ProductSkuStatus");
        $scope.cardTypeList = enumData.getList("CardType");

        $scope.productSku = {
            productId: $scope.data.productId,
            name: "",
            code: "",
            cardType: "",
            status: "NORMAL",
            price: "",
            priceOrg: "",
            sequence: "",
            isDefault: false,
            skuStore: 0
        };
        $scope.save = function (event) {
            http.post({
                url: "productManage/addProductSku.do",
                data: $scope.productSku,
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