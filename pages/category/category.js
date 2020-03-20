// pages/category/category.js
const db = wx.cloud.database()
const category = db.collection("category")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: "搜索",
    // 左侧菜单数据
    leftMenuList:[],  
    // 右侧商品数据
    rightContent:[],
    // 被点击的左侧菜单索引
    currentIndex:0
  },
  /**数据库的返回数据 */
  Cates:[],

  /**获取分类页面数据 */
  getCategory:function(){
    category.get().then(res =>{
      this.Cates = res.data
      //把接口数据存入本地存储中
      wx.setStorageSync("cates", {time:Date.now(),data:this.Cates})
      console.log(this.Cates)
      // 构造左侧菜单数据
      let leftMenuList = this.Cates
      //构造右侧商品数据
      let rightContent = this.Cates[0].products
      this.setData({
        leftMenuList,
        rightContent
      })
    })
  },
  /**左侧菜单点击事件处理 */
  handleItemTap:function(e){
    const {index} = e.currentTarget.dataset;
    let rightContent = this.Cates[index].products
    this.setData({
      currentIndex: index,
      rightContent
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //首先获取本地存储中的数据
    const Cates = wx.getStorageSync("cates")
    //判断数据是否存在
    if (!Cates) {
      this.getCategory()
    }else{
      //判断数据是否过期，定义过期时间为5分钟
      if(Date.now()-Cates.time>1000*60*5){
        this.getCategory()
      }else{
        this.Cates = Cates.data
        // 构造左侧菜单数据
        let leftMenuList = this.Cates
        //构造右侧商品数据
        let rightContent = this.Cates[0].products
        this.setData({
          leftMenuList,
          rightContent
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})