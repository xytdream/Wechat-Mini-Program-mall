const db = wx.cloud.database()
const goods = db.collection('goods')
const orders = db.collection('orders')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        value: "已发布",
        isActive: true
      },
      {
        id: 1,
        value: "已售出",
        isActive: false
      }
    ],
    publishGoods:[],
    saleGoods:[]
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //判断进入当前页面的入口，显示对应的数据
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const { id } = currentPage.options
    let { tabs } = this.data
    tabs.forEach(v => v.id == id ? v.isActive = true : v.isActive = false)
    this.setData({tabs})

    //获取已发布商品数据
    this.getPublishGoodsList()

    //获取已售出商品数据
    this.getSaleGoodsList()
  },

  //标题点击事件
  handletabsItemChange(e) {

    //获取被点击的标题索引
    const { index } = e.detail
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false)
    this.setData({ tabs })

    //修改页面参数,这是为了在当前类别点进商品详情后从商品详情返回仍然是当前类别，如果不这么做，每次返回都是第一次点进时的类别
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    currentPage.options.id = index
    console.log(currentPage.options)
  },

  // 获取已发布商品列表
  getPublishGoodsList(){
    let { publishGoods } = this.data
    goods.where({
      _openid: app.userInfo.openid,
      saleStatus: '待售出'
    }).orderBy('date','desc').get().then(res =>{
      publishGoods = res.data
      this.setData({publishGoods})
    })
  },

  //获取已售出商品列表
  getSaleGoodsList(){
    let { saleGoods } = this.data
    goods.where({
      _openid: app.userInfo.openid,
      saleStatus: '已售出'
    }).orderBy('date', 'desc').get().then(res => {
      saleGoods = res.data
      this.setData({ saleGoods })
    })
  },

  //取消售卖
  handleCanclePublish(e){
    // console.log(e.currentTarget.dataset)
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '是否撤回该商品？',
      success(res) {
        if (res.confirm) {
          goods.where({
            _id: id
          }).remove().then(res => {
            wx.showToast({
              title: '撤回成功',
              icon: 'success',
            })
            //刷新当前页面
            const pages = getCurrentPages()
            const page = pages[pages.length - 1]
            page.onShow()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  }
})