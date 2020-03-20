const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  handleGetUserInfo(e){
    // console.log(e)
    const {userInfo} = e.detail
    wx.cloud.callFunction({
      name: 'login'
    }).then(res =>{
      // console.log(res)
      userInfo.openid = res.result.openid
      app.userInfo = userInfo
      wx.setStorageSync("userInfo", userInfo)
      wx.navigateBack({
        delta: 1
      })
    })
  }
})