const db = wx.cloud.database()
const goods = db.collection("goods")
const cp = db.collection("cart_products")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodInfo:[],
    no_image:[
      'cloud://zs-t8s3y.7a73-zs-t8s3y-1300646863/NO/no_intro.png',
      'cloud://zs-t8s3y.7a73-zs-t8s3y-1300646863/NO/no_img.jpg',
      'cloud://zs-t8s3y.7a73-zs-t8s3y-1300646863/NO/no_intro.png'
    ],
    //商品是否被收藏标识
    // isCollect: false
  },
  goodsID: 0,
  cart_product: [],
  flag: 0,


  onShow: function () {
    // 获取当前页面栈
    let pages = getCurrentPages()
    //获取当前页面对象
    let currentPage = pages[pages.length - 1]
    let options = currentPage.options
    // console.log(options)
    // 接收商品列表页面传过来的商品的标识
    this.goodsID = options.goodsID
    // console.log(this.goodsID)
    this.getGoodsInfo()
    
  },

  //获取商品详情数据
  getGoodsInfo(){
    goods.where({
      goodsID: this.goodsID
    }).get().then(res =>{
      const goodInfo = res.data
      // 获取收藏数据
      // let collect = wx.getStorageSync("collect")||[]
      // let isCollect = collect.some(v => v.goodsID === goodInfo[0].goodsID)
      this.setData({
        goodInfo
        // isCollect
      })
    })
  },

  //点击图片预览
  handlePreviewImage(e){
    //构造要预览的图片数组
    const urls = this.data.goodInfo[0].pics
    const current = e.currentTarget.dataset.url
    wx.previewImage({
      urls,
      current
    })
  },
  //获取购物车数据
  getCartInfo(callback){
    cp.where({
      goodsID: this.goodsID,
      _openid: app.userInfo.openid
    }).get().then(res => {
      this.cart_product = res.data
      // console.log(this.cart_product)
      this.flag = this.cart_product.length
      callback()
    })
  },
  //添加购物车方法
  addCart(){
    if (this.flag != 0) {
      //如果购物车中该商品已存在，提示用户
      wx.showToast({
        title: '已存在于购物车',
        icon: 'none'
      })
    } else {
      //如果购物车中没有该商品，将商品信息存入购物车表中，并提示用户添加成功
      cp.add({
        data: {
          goodsID: this.data.goodInfo[0].goodsID,
          price: this.data.goodInfo[0].price,
          title: this.data.goodInfo[0].title,
          img: this.data.goodInfo[0].main_img,
          checked: false
        }
      }).then(res => {
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          mask: true
        })
      })
    }
  },
  //点击加入购物车操作
  handleCartAdd(){
    if (app.userInfo.openid) {
      this.getCartInfo(this.addCart)
    }else{
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
    
  },

  //点击收藏
  // handleCollect(){
  //   let isCollect = false
  //   let collect = wx.getStorageSync("collect")||[]
  //   //判断是否被收藏
  //   let index = collect.findIndex(v =>v.goodsID===this.goodsID)

  //   if(index!==-1){
  //     //能找到 已收藏 做取消收藏操作
  //     collect.splice(index,1)
  //     isCollect = false
  //     wx.showToast({
  //       title: '取消收藏',
  //       icon: 'success',
  //       mask: true
  //     })
  //   }else{
  //     //未收藏 做收藏操作
  //     collect.push(this.data.goodInfo[0])
  //     isCollect = true
  //     wx.showToast({
  //       title: '收藏成功',
  //       icon: 'success',
  //       mask: true
  //     })
  //   }

  //   //把数组存入缓存中
  //   wx.setStorageSync("collect", collect)
  //   //修改data中的isCollect
  //   this.setData({isCollect})
  // }

})