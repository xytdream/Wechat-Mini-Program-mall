const db = wx.cloud.database()
const goods = db.collection("goods")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**商品成色数组 */
    conditions: [
      { name: "brand", value: "全新" },
      { name: "nine", value: "九成新", checked: "true" },
      { name: "eight", value: "八成新" },
      { name: "seven", value: "七成新" },
      { name: "belowSeven", value: "七成新以下" },
    ],
    /**商品图片临时地址数组 */
    goodImgs:[],
    /**商品图片上传到云之后的地址数组 */
    cPath: [],
    //商品图片长按标识
    longtapFlag: false,
    /**商品标题最大输入长度 */
    maxlength:30,
    /**商品标题 */
    title: "",
    /**商品文字介绍 */
    introText: "",
    /**商品价格 */
    price: "",
    /**商品成色 */
    condition: "九成新",
  },

  /**
   * 点击添加图片
   */
  handleAddPics(){
    let {goodImgs} = this.data
    let count = 9 - goodImgs.length
    // console.log(count)
    wx.chooseImage({
      count: Number(count),
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res)=> {
        // 获取返回的新的临时存储路径
        const tempFilePaths = res.tempFilePaths
        //与已有的临时存储路径进行数组拼接
        goodImgs = goodImgs.concat(tempFilePaths)
        this.setData({
          goodImgs
        })
      },
    })
  },

  /**
   * 长按图片显示删除按钮
   */
  handleDeleteIcon(){
    let {longtapFlag} = this.data
    longtapFlag = true
    this.setData({ longtapFlag })
  },
  /**
   * 取消长按
   */
  cancelLongtap(){
    this.setData({
      longtapFlag: false
    })
  },

  /**
   * 删除图片
   */
  handleDeleteImg(e){
    const { index } = e.target.dataset
    let { goodImgs } = this.data
    goodImgs.splice(index,1)
    this.setData({ goodImgs })
  },

  /**
   * 标题输入事件处理
   */
  handleTitleInput(e) {
    let title = e.detail.value
    let maxlength = 30
    maxlength = maxlength - title.length
    this.setData({ title , maxlength })
  },

  /**
   * 商品介绍文本输入事件处理
   */
  handleIntroTextInput(e) {
    let introText = e.detail.value
    this.setData({ introText })
  },

  /**
   * 商品价格输入事件处理
   */
  handlePriceInput(e) {
    let price = e.detail.value
    this.setData({ price })
  },

  /**
   * 成色选择事件处理
   */
  handleRadioChange(e){
    let condition = e.detail.value
    this.setData({ condition })
  },

  /**
   * 上传图片
   */
  /**
  * 上传图片
  */
  uploadImgs() {
    const { goodImgs, cPath } = this.data
    const length = goodImgs.length

    for (let i = 0; i < length; i++) {
      const filePath = goodImgs[i]
      console.log(Date.now())
      const cloudPath = Date.now() + Math.floor(Math.random()*10000) + filePath.match(/\.[^.]+?$/)

      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
      }).then(res => {
        cPath.push(res.fileID)
        // console.log(cPath)
        this.setData({
          cPath
        })
      }).catch(error => {
        console.log(error)
      })
    }
  },

  /**
   * 发布商品
   */
  handlePublish(){
    let _this = this
    if (app.userInfo.openid){
      const { title, goodImgs, introText, price, condition } = this.data

      if (title.trim().length == 0) {
        wx.showToast({
          title: '标题不能为空~',
          icon: 'none',
        })
      } else if (introText.trim().length == 0) {
        wx.showToast({
          title: '请对您的宝贝进行描述~',
          icon: 'none',
        })
      } else if (price.length == 0) {
        wx.showToast({
          title: '请输入宝贝的价格~',
          icon: 'none',
        })
      } else {
        wx.showLoading({
          title: '正在发布中',
        })
        //开始上传图片
        this.uploadImgs()
        // 等待图片上传完毕
        setTimeout(() => {
          const { cPath } = this.data
          console.log(cPath)
          
          goods.add({
            data: {
              userInfo: app.userInfo,
              goodImgs: cPath,
              title: title,
              introText: introText,
              price: price,
              condition: condition,
              date: new Date(),
              saleStatus: "待售出"
            }
          }).then(res =>{
            wx.hideLoading()
            _this.setData({
              goodImgs:[],
              title: "",
              introText: "",
              price: "",
            })

            wx.showToast({
              title: '发布成功',
              icon: 'success',
            })
          })
        }, 6000)
      }
    }else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  /**
   * 页面显示函数
   */
  onShow(){
    const userInfo = wx.getStorageSync("userInfo") || {}
    app.userInfo = userInfo
  }

})