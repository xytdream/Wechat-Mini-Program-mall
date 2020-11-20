const db = wx.cloud.database()
const orders = db.collection("orders")
const cp = db.collection("cart_products")
const goods = db.collection("goods")
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    pay: [],
    totalNum: 0,
    totalPrice: 0,
    payAgain:{}
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取缓存中的地址信息，待支付商品信息
    const address = wx.getStorageSync("address")
    this.setData({address})
    //获取data中的数据
    let {pay,payAgain} = this.data
    if(pay.length == 0 && !payAgain.orderNum){
      pay = wx.getStorageSync("pay") || []
      payAgain = wx.getStorageSync("payAgain") || {}
      //拿到数据后移除pay缓存
      wx.removeStorageSync("pay")
      wx.removeStorageSync("payAgain")
    }
    // 判断数据来自订单待付款还是购物车
    if(payAgain.orderNum){
      pay = payAgain.goods
    }
    //总价格 总数量
    let totalNum = 0
    let totalPrice = 0
    pay.forEach(v => {
      totalNum++
      totalPrice += Number(v.goodInfo.price)
    })
    //把数据重新设置回data中
    this.setData({
      pay,
      totalNum,
      totalPrice,
      payAgain
      // address
    })
  },
  onHide(){
    let _this = this
    clearTimeout(_this.timer)
  },

  //收货地址选择
  handleChooseAddress() {
    if (app.userInfo.openid) {
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
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },

  //支付按钮功能
  handlePay() {
    let _this = this
    const {address} = this.data
    if(!address.userName){
      wx.showToast({
        title: '请选择收货地址哦~',
        icon: 'none'
      })
    }else{
      const { totalPrice, payAgain } = this.data
      //判断待支付订单的来处
      if (payAgain.orderNum) {
        //待支付订单从待付款页面来
        wx.showModal({
          title: '支付',
          content: '确认支付 ￥' + totalPrice,
          success(res) {
            if (res.confirm) {
              //确认支付
              orders.doc(payAgain._id).update({
                data: {
                  logisticsID: 1,
                  logistics: "待发货"
                }
              })
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })
              var timer = setTimeout(function(){
                wx.navigateTo({
                  url: '/pages/orders/orders?id=2'
                })
              }, 2000)
            }else if (res.cancel){
              //取消支付
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
              var timer = setTimeout(function(){
                wx.navigateTo({
                  url: '/pages/orders/orders?id=1'
                })
              }, 2000)
            }
          }
        })
      } else {
        //待支付订单从购物车来
        wx.showModal({
          title: '支付',
          content: '确认支付 ￥' + totalPrice,
          success(res) {
            if (res.confirm) {
              const logisticsID = 1
              const logistics = "待发货"
              //创建订单
              _this.createOrder(logisticsID, logistics)
              wx.showToast({
                title: '支付成功',
                icon: 'success'
              })
              var timer = setTimeout(function () {
                wx.navigateTo({
                  url: '/pages/orders/orders?id=2'
                })
              }, 2000)
            } else if (res.cancel) {
              const logisticsID = 0
              const logistics = "待付款"
              //创建订单
              _this.createOrder(logisticsID, logistics)
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
              var timer = setTimeout(function () {
                wx.navigateTo({
                  url: '/pages/orders/orders?id=1'
                })
              }, 2000)
            }
          }
        })
      }
    }
  },
  // 跳转到购物车页面
  toOrder(id){
    wx.navigateTo({
      url: '/pages/orders/orders?id=' + id,
    })
  },

  //创建订单
  createOrder(logisticsID, logistics){
    //根据当前时间生成订单号
    // 获取当前时间的年、月、日、时、分、秒、毫秒，并转换为字符串
    let date = new Date()
    let year = (date.getFullYear()).toString()
    let month = (date.getMonth() + 1).toString()
    let day = (date.getDate()).toString()
    let hour = (date.getHours()).toString()
    let min = (date.getMinutes()).toString()
    let second = (date.getSeconds()).toString()
    let milliSec = (date.getMilliseconds()).toString()

    //拼接字符串，生成订单号
    let orderNum = year + month + day + hour + min + second + milliSec
    console.log(orderNum)

    //创建订单，并将订单信息存入订单表中
    //1.获得data中的数据
    const { address, pay, totalNum, totalPrice } = this.data
    //2.将信息添加进订单表中
    orders.add({
      data:{
        orderNum: orderNum,
        address: address,
        goods: pay,
        totalNum: totalNum,
        totalPrice: totalPrice,
        logistics: logistics,
        logisticsID: logisticsID
      }
    }).then(res =>{
      pay.forEach(v =>{
        //从所有用户的购物车中删除已生成订单的商品
        cp.where({
          goodsID: v.goodsID
        }).remove()
        // 从商品数据库中更新商品售卖状态saleStatus
        goods.where({
          _id: v.goodsID
        }).update({
          data:{
            saleStatus: "已售出"
          }
        })
      })
    })
  }
})