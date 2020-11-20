/**
 * 1.获取用户的收货地址
 *  1.绑定点击事件
 *  2.获取用户对小程序所授予获取地址的权限状态 scope
 *    1.假设 用户 点击获取收货地址的提示框 确定
 *      authSetting scope.address: true 可直接调用获取收货地址API
 *    2.假设点击 取消
 *      scope.address: false
 *    3.假设用户从来没调用过 收货地址的API
 *      scope undefined 可直接调用获取收货地址API
 *        1.诱导用户重新授权给小程序
 *        2.获取收货地址
 * 2.全选的实现
 *  1.onshow 获取数据库数组
 *  2.根据购物车中的商品数据，所有商品都被选中，全选就被选中
 */

const db = wx.cloud.database()
const cp = db.collection("cart_products")
const goods = db.collection("goods")
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: {},
    cart:[],
    allChecked: false,
    totalNum:0,
    totalPrice:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userInfo = wx.getStorageSync("userInfo") || {}
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取购物车列表数据
    if(app.userInfo.openid){
      cp.where({
        _openid: app.userInfo.openid
      }).get().then(res => {
        const cart = res.data
        this.setCart(cart)
      })
    }else{
      const cart = []
      this.setCart(cart)
    }
    
    // 获取缓存中的地址信息
    // const address = wx.getStorageSync("address")
    // this.setData({
    //   address
    // })
  },

  //收货地址选择
  // handleChooseAddress() {
  //   if(app.userInfo.openid){
  //     wx.getSetting({
  //       success: (result) => {
  //         const scopeAddress = result.authSetting["scope.address"]
  //         if (scopeAddress === false) {
  //           wx.openSetting({
  //             success: (result1) => {
  //               wx.chooseAddress({
  //                 success: (result2) => {
  //                   wx.setStorageSync("address", result2)
  //                 }
  //               })
  //             }
  //           })
  //         } else {
  //           wx.chooseAddress({
  //             success: (result3) => {
  //               wx.setStorageSync("address", result3)
  //             }
  //           })
  //         }
  //       }
  //     })
  //   }else{
  //     wx.navigateTo({
  //       url: '/pages/login/login',
  //     })
  //   }
  // },

  //商品的选中与取消选中
  handleItemChange(e){
    //获取被修改的商品的goodsID
    const id = e.currentTarget.dataset.id
    //获取购物车数组
    let {cart} = this.data;
    //找到被修改的商品对象的索引
    let index = cart.findIndex(v =>v.goodsID===id);
    //根据索引找到商品对象，并对checked属性取反
    cart[index].checked = !cart[index].checked
    //重新计算底部数据
    this.setCart(cart)
  },

  //设置购物车状态以及底部数据的计算
  setCart(cart){
    let allChecked = true
    //总价格 总数量
    let totalNum = 0
    let totalPrice = 0
    cart.forEach(v => {
      if (v.checked) {
        totalNum++
        totalPrice += Number(v.goodInfo.price)
      } else {
        allChecked = false
      }
    })
    //判断cart数组是否为空
    allChecked = (cart.length != 0) ? allChecked : false
    //把数据重新设置回data中
    this.setData({
      cart,
      totalNum,
      totalPrice,
      allChecked
    })
    wx.setStorageSync("cart", cart)
  },

  //全选与反选
  handleItemAllCheck(){
    //获取data中的数据
    let {cart,allChecked} = this.data
    //修改值，allChecked取反，cart数组中的商品选中状态checked全部跟随allChecked
    allChecked = !allChecked
    cart.forEach(v => v.checked = allChecked)
    //修改后的值填充回data中
    this.setCart(cart)
  },

  //商品删除
  handleItemDelete(e){
    //获取要删除的商品的goodsID
    const id = e.currentTarget.dataset.id
    //获取data中的数据
    let {cart} = this.data
    //找到被删除的数组中的索引
    let index = cart.findIndex(v => v.goodsID === id);
    wx.showModal({
      title: '提示',
      content: '是否删除该商品？',
      success:(res)=>{
        if(res.confirm){
          //点击确定删除数组中的商品
          cart.splice(index,1)
          this.setCart(cart)
          //同时删除数据库中的数据
          cp.where({
            _openid: app.userInfo.openid,
            goodsID: id
          }).remove()
        }
      },
    })
  },

  //结算功能
  handlePay(){
    // const {address} =this.data;
    const {totalNum} = this.data;
    // if(!address.userName){
    //   wx.showToast({
    //     title: '还没有选择收货地址哦~',
    //     icon: 'none'
    //   })
    // } else 
    if (totalNum == 0){
      wx.showToast({
        title: '还没有选中待购商品哦~',
        icon: 'none'
      })
    }else{
      //从购物车数组中过滤出要支付的商品
      const {cart} = this.data
      let pay = cart.filter(v => v.checked)
      //将pay存入缓存中
      wx.setStorageSync("pay", pay)
      //跳转到支付页面
      wx.navigateTo({
        url: '/pages/pay/pay',
      })
    }
  }



})