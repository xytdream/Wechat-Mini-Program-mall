// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:""
  },

  //获取输入框输入的值
  handleInput(e){
    // console.log(e)
    let {value} = e.detail
    value = value.trim()
    console.log(value)
    this.setData({value})
  },

  //点击搜索按钮
  handleSearch(){
    const {value} = this.data
    wx.navigateTo({
      url: '/pages/goods/goods?query='+value,
    })
    this.setData({
      value:""
    })
  }

})