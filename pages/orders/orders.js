const db = wx.cloud.database()
const orders = db.collection("orders")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: "全部订单",
        isActive: true
      },
      {
        id: 1,
        value: "待付款",
        isActive: false
      },
      {
        id: 2,
        value: "待发货",
        isActive: false
      },
      {
        id: 3,
        value: "待收货",
        isActive: false
      },
      {
        id: 4,
        value: "退款/售后",
        isActive: false
      }
    ],
    ordersAll:[],
    ordersWaitPay:[],
    ordersWaitShip:[],
    ordersWaitReceiving:[],
    ordersCompleted: []
  },

  onShow(){
    //判断进入当前页面的入口，显示对应的数据
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const {id} = currentPage.options
    let {tabs} = this.data
    tabs.forEach(v => v.id == id ? v.isActive = true : v.isActive = false)
    this.setData({tabs})
    //获取订单数据
    this.getOrdersList()
  },

  onUnload(){
    wx.reLaunch({
      url: '/pages/user/user',
    })
  },


  //标题点击事件
  handletabsItemChange(e) {
    //获取被点击的标题索引
    const { index } = e.detail
    wx.navigateTo({
      url: '/pages/orders/orders?id='+index,
    })
    // //修改原数组
    // let { tabs } = this.data;
    // tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false)
    // this.setData({
    //   tabs
    // })
  },

  //获取全部订单列表
  getOrdersList(){
    orders.where({
      _openid : app.userInfo.openid
      // _openid: "oHmSQ4rhBxCpY3dg9wVHIEGj-Xi4"
    }).orderBy('orderNum','desc').get().then(res =>{
      const ordersAll = res.data
      const ordersWaitPay = ordersAll.filter(v => v.logisticsID == 0)
      const ordersWaitShip = ordersAll.filter(v => v.logisticsID == 1)
      const ordersWaitReceiving = ordersAll.filter(v => v.logisticsID == 2)
      const ordersCompleted = ordersAll.filter(v => v.logisticsID == 3)
      this.setData({
        ordersAll,
        ordersWaitPay,
        ordersWaitShip,
        ordersWaitReceiving,
        ordersCompleted
      })
    })
  },

  //去支付
  handleToPay(e){
    const  orderNum  = e.currentTarget.dataset.ordernum
    const {ordersAll} = this.data
    const currentOrder = ordersAll.filter(v => v.orderNum == orderNum)
    const payAgain = currentOrder[0]
    wx.setStorageSync("payAgain", payAgain)
    wx.navigateTo({
      url: '/pages/pay/pay',
    })
    
  },

  //提醒发货
  handleRemindShip(){
    wx.showToast({
      title: '已提醒商家~',
      icon: 'none'
    })
  },

  //确认收货
  handleConfirmReceiving(e){
    const orderNum = e.currentTarget.dataset.ordernum
    wx.showModal({
      title: '提示',
      content: '是否确认收货？',
      success: res =>{
        if(res.confirm){
          orders.where({
            orderNum: orderNum
          }).update({
            data: {
              logisticsID: 3,
              logistics: "已完成"
            }
          }).then(res => {
            wx.navigateTo({
              url: '/pages/orders/orders?id=4',
            })
          })
        }
      }
    })
  },


  //申请售后
  handleAfterSale(){
    console.log("申请售后")
  },
  //申请退款
  handleRefund(){
    console.log("申请退款")
  }


  
})