// pages/collect/collect.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: "商品",
        isActive: true
      },
      {
        id: 1,
        value: "品牌",
        isActive: false
      },
      {
        id: 2,
        value: "店铺",
        isActive: false
      }
    ],
    collect: []
  },

  onShow(){
    const collect=wx.getStorageSync("collect")
    this.setData({collect})
  },

  //标题点击事件
  handletabsItemChange(e) {
    //获取被点击的标题索引
    const { index } = e.detail
    //修改原数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false)
    this.setData({
      tabs
    })
  },

 
})