const db = wx.cloud.database()
const goods = db.collection("goods")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: "搜索",
    tabs:[
      {
        id:0,
        value:"综合",
        isActive:true
      },
      {
        id:1,
        value:"价格",
        isActive:false
      }
    ],
    goodsList:[],
    goodsListPriceAsc:[]

  },
  //用于获取传递过来的参数
  cid: 0,
  type_id: 0,
  query: "",

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取传递过来的参数
    // this.cid = options.cid||0
    // this.type_id = options.type_id||0
    this.query = options.query
    // console.log(this.query)
    // if (this.cid !== 0){
    //   this.getGoodsListByCid()
    // }else if(this.type_id !== 0){
    //   this.getGoodsListByType()
    // }else{
    //   // console.log(this.query)
    //   this.getGoodsListByQuery()
    // }
    this.getGoodsListByQuery()
    //获取商品铵价格升序的数组
    let _this = this
    setTimeout(function(){
      let { goodsList, goodsListPriceAsc } = _this.data
      function compare(property) {
        return function (a, b) {
          var value1 = Number(a[property]);
          var value2 = Number(b[property]);
          return value1 - value2;
        }
      }
      // console.log(goodsList)
      goodsListPriceAsc = goodsList.sort(compare('price'))
      _this.setData({ goodsListPriceAsc })
    },3000)
    
  },

  //标题点击事件
  handletabsItemChange(e) {
    //获取被点击的标题索引
    const { index } = e.detail
    //修改原数组
    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false)
    this.setData({
      tabs
    })
  },

  // 通过cid获取商品列表
  getGoodsListByCid(){
    goods.where({
      cid: this.cid
    }).get().then(res =>{
      // console.log(res)
      this.setData({
        goodsList: res.data
      })
    })

    //关闭下拉刷新窗口 有则关闭，没有也不影响
    wx.stopPullDownRefresh()
  },
  // 通过type_id获取商品列表
  getGoodsListByType() {
    goods.where({
      type_id: this.type_id
    }).get().then(res => {
      // console.log(res)
      this.setData({
        goodsList: res.data
      })
    })

    //关闭下拉刷新窗口 有则关闭，没有也不影响
    wx.stopPullDownRefresh()
  },

  //通过关键字获取商品列表
  getGoodsListByQuery() {
    goods.where({
      title: new db.RegExp({
        regexp:'.*'+ this.query,
        options: "ig"
      }),
      saleStatus:"待售出"
    }).get().then(res => {
      // console.log(res)
      this.setData({
        goodsList: res.data,
        value: this.query
      })
    })

    //关闭下拉刷新窗口 有则关闭，没有也不影响
    wx.stopPullDownRefresh()
  },

  /**
   * 生命周期函数---监听用户下拉动作
   */
  onPullDownRefresh:function(){
    //重置商品数据
    this.setData({
      goodsList:[]
    })
    //重新请求数据库数据
    this.getGoodsList()
  },
  /**
   * 生命周期函数---监听用户上拉触底事件
   */
  onReachBottom:function(){
    wx.showToast({
      title: '滑到底了~',
    })
  }
})