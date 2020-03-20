const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    collectNums: 0
  },

  onShow(){
    // const au = app.userInfo
    // const ssu = wx.getStorageSync("userInfo")
    // const userInfo = app.userInfo
    const userInfo = app.userInfo.nickName ? app.userInfo : wx.getStorageSync("userInfo")
    app.userInfo = userInfo
    const collect = wx.getStorageSync("collect")||[]
    this.setData({
      userInfo,
      collectNums: collect.length
    })
  },
  //退出
  handleExit(){
    app.userInfo = {}
    this.setData({
      userInfo: app.userInfo
    })
    wx.clearStorageSync()
  },
  //收获地址管理
  handleChooseAddress() {
    if (app.userInfo.openid){
      wx.getSetting({
        success: (result) => {
          const scopeAddress = result.authSetting["scope.address"]
          if (scopeAddress === false) {
            wx.openSetting({
              success: (result1) => {
                wx.chooseAddress({
                  success: (result2) => {
                    wx.setStorageSync("address", result2)
                  }
                })
              }
            })
          } else {
            wx.chooseAddress({
              success: (result3) => {
                wx.setStorageSync("address", result3)
              }
            })
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  /**
   * 监听用户分享操作
   */
  onShareAppMessage(){
    return{
      title: "小T优品",
      path: "/pages/index/index"
    }
  }
})