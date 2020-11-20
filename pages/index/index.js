// pages/index/index.js
const db = wx.cloud.database()
const bannerList = db.collection("bannerList")
const navigateList = db.collection("navigateList")
const dailyGoods = db.collection("dailyGoods")
const goods = db.collection("goods")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: "搜索",
    bannerImages:[],
    navigateImages:[],
    dailyGoods:[]
  },
  /**获取轮播图数据 */
  getBannerList: function(){
    bannerList.get().then(res => {
      // console.log(res.data)
      this.setData({
        bannerImages: res.data
      })
      // console.log(this.data.bannerImages)
    })
  },
  /**获取导航栏数据 */
  getNavigateList: function(){
    navigateList.get().then(res =>{
      // console.log(res)
      this.setData({
        navigateImages: res.data
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    app.userInfo = wx.getStorageSync("userInfo")||{}
    this.getBannerList()
    this.getNavigateList()
    this.getDailyGoods()
  },

  //点击导航操作
  handleItemSelect(e){
    // 获取传过来的type_id
    const { query } = e.currentTarget.dataset
    // console.log(type_id)
    // 对type_id进行判断，对应的id跳转对应的界面
    wx.navigateTo({
      url: '/pages/goods/goods?query=' + query,
    })
    
  },

  /**
   * 获取每日上新商品数据
   */
  getDailyGoods(){
    goods.where({
      saleStatus:"待售出"
    }).orderBy('date','desc').limit(6).get().then(res => {
      // console.log(res.data)
      const dailyGoods = res.data
      // console.log(dailyGoods)
      this.setData({
        dailyGoods
      })
    })
  },
  /**
   * 生命周期函数---监听用户上拉触底事件
   */
  onReachBottom: function () {
    wx.showToast({
      title: '滑到底了~',
    })
  }
})