"use strict";
define([], function () {
    return {
        index: "product.product-list",
        module: "familydoctor",
        alias: {},
        nav: ["$q", function ($q) {
            /**如果菜单不需要后台交互等异步方式可以直接把数据数组定义在nav上*/
            var deferred = $q.defer();
            var navData = [{
                name: "家庭医生",
                nav: [{
                    name: "销售管理",
                    nav: [
                        {
                            name: "卡查询",
                            path: "sale.card-search"
                        },
                        {
                            name: "已售卡汇总",
                            path: "sale.card-summary"
                        },
                        /*{
                         name: "用户查询",
                         path: "sale.user-search"
                         },
                         {
                         name: "销售查询",
                         path: "sale.sale-search"
                         },*/
                        {
                            name: "订单查询",
                            path: "sale.order-search"
                        }
                        /*,{
                         name: "设置和导出",
                         path: "sale.settings"
                         }*/
                    ]
                }, {
                    name: "家庭医生卡",
                    nav: [
                        /*{
                         name: "卡片列表",
                         path: "card.card"
                         },*/
                        {
                            name: "批量采购",
                            path: "card.ent"
                        },
                        /*{
                         name: "批量生成",
                         path: "card.gen"
                         },*/
                        {
                            name: "关键词",
                            path: "doctor.keywords-list"
                        }
                    ]
                }, {
                    name: "商品管理",
                    nav: [
                        {
                            name: "商品列表",
                            path: "product.product-list"
                        },
                        {
                            name: "商品渠道",
                            path: "product.channel-list"
                        }
                    ]
                }]
            }];
            deferred.resolve(navData);
            return deferred.promise;
        }]
    };
});