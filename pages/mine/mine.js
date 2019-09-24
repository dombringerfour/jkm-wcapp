// pages/mine/mine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    currenttopbar:0,//0:想看,1:看过,2:喜欢
    button:true,
    topbarlist:[
      {
        title:'我想看的'
      },
      {
        title:'我看过的'
      },
      {
        title:'我喜欢的'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showToast({
      title: 'Loading......',
      image: '../../images/Loading.gif'
    })
    var data = wx.getStorageSync('Want') ? wx.getStorageSync('Want') : [];
    if(data.length==0){
      this.setData({
        button:false
      })
    } else {
      this.setData({
        button: true
      })
    }
    this.setData({
      list: data,
      currenttopbar: 0
    });
    wx.hideToast();
  },
  // 点击顶部分类
  toactive:function(e){
    wx.showToast({
      title: 'Loading......',
      image: '../../images/Loading.gif'
    })
    if (e.target.dataset.index==0){
      this.setData({
        list: wx.getStorageSync('Want') ? wx.getStorageSync('Want') : []
      })
    }
    else if (e.target.dataset.index == 1){
      this.setData({
        list: wx.getStorageSync('HaveSee') ? wx.getStorageSync('HaveSee') : []
      })
    }
    else if (e.target.dataset.index == 2){
      this.setData({
        list: wx.getStorageSync('Love') ? wx.getStorageSync('Love') : []
      })
    }
    if (this.data.list.length==0) {
      this.setData({
        button: false
      })
    }else{
      this.setData({
        button: true
      })
    }
    this.setData({
      currenttopbar:e.target.dataset.index,
      zerotop:0
    });
    wx.hideToast();
  },
  //清空当前列表
  delete:function(){
    var that = this;
    wx.showModal({
      title: '清空当前列表',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了
          if (that.data.currenttopbar == 0) {
            wx.removeStorageSync('Want');
            that.setData({
              button: false,
              list: wx.getStorageSync('Want')
            })
          } else if (that.data.currenttopbar == 1) {
            wx.removeStorageSync('HaveSee');
            that.setData({
              button: false,
              list: wx.getStorageSync('HaveSee')
            })
          }
          else if (that.data.currenttopbar == 2) {
            wx.removeStorageSync('Love');
            that.setData({
              button: false,
              list: wx.getStorageSync('Love')
            })
          }
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
    
  },
  // 修改所有表中数据
  selectChange: function (changeId,type){
    var listArr = ['Want','HaveSee','Love'];
    for(var i=0;i<listArr.length;i++){
      if (wx.getStorageSync(listArr[i])){
        var newCurrentList = wx.getStorageSync(listArr[i]).map(item => {
          if (item.id == changeId) {
            item[type] = !item[type];
          }
          return item;
        })
        wx.setStorageSync(listArr[i], newCurrentList)
      }
    }
  },
  // 判断想看、看过、喜欢的值
  checkif: function (type, checkid) {
    var wantList = wx.getStorageSync('Want');
    var haveseeList = wx.getStorageSync('HaveSee');
    var loveList = wx.getStorageSync('Love');
    if (type == 'want') {//想看
      for (var i = 0; i < wantList.length; i++) {
        if (checkid == wantList[i].id) {
          return wantList[i].want
        }
      }
    }
    if (type == 'havesee') {//看过
      for (var i = 0; i < haveseeList.length; i++) {
        if (checkid == haveseeList[i].id) {
          return haveseeList[i].havesee
        }
      }
    }
    if (type == 'love') {//喜欢
      for (var i = 0; i < loveList.length; i++) {
        if (checkid == loveList[i].id) {
          return loveList[i].love
        }
      }
    }
  },
  // 点击“想看”
  towant: function (e) {
    var dataset = e.target.dataset;
    var that = this;
    // 改变当前数据的want的值，取反表示是否想看
    this.data.list[e.target.dataset.index].want = !this.data.list[e.target.dataset.index].want;
    // 并更新rightcontentlist的数据
    this.setData({
      list: this.data.list
    });
    // 从本地存储中获取数据
    var wantarr = wx.getStorageSync('Want') ? wx.getStorageSync('Want') : [];
    // 定义可写入本地存储的开关为关闭状态
    var ifwrite = false;
    if (wantarr.length == 0) {// 当本地存储中没有数据时
      wx.setStorageSync('Want', wantarr.concat({
        cover: e.target.dataset.item.cover,
        id: e.target.dataset.item.id,
        index: e.target.dataset.item.index,
        is_new: e.target.dataset.item.is_new,
        rate: e.target.dataset.item.rate,
        title: e.target.dataset.item.title,
        url: e.target.dataset.item.url,
        want: that.checkif('want', e.target.dataset.item.id) ? true : false,
        love: that.checkif('love', e.target.dataset.item.id) ? true : false,
        havesee: that.checkif('havesee', e.target.dataset.item.id) ? true : false
      }));
      that.selectChange(e.target.dataset.item.id, 'want');
    } else {//本地存储有数据时
      for (var i = 0; i < wantarr.length; i++) {
        // 每一条进行判断，如果相等则表示本地存储中有这条数据，开关关闭，跳出循环，只有所有数据都不等于当前写入电影的id，才开关才会被打开
        if (wantarr[i].id == e.target.dataset.item.id) {
          this.selectChange(e.target.dataset.item.id, 'want');
          var newmovieslist = wx.getStorageSync('Want').filter(item => {
            return item.id != e.target.dataset.item.id
          })
          wx.setStorageSync('Want', newmovieslist);
          ifwrite = false;
          break;
        } else {
          ifwrite = true;
        }
      }
      if (ifwrite == true) {// 如果开关是开的状态，写入数据
        // 在原表中修改当前点击数据的Want信息
        this.selectChange(e.target.dataset.item.id, 'want');
        // 将rightcontentlist数据写入本地存储（这里是同步存储，替换原来本地存储中的数据）
        wx.setStorageSync(
          'Want',
          wantarr.concat({
            cover: e.target.dataset.item.cover,
            havesee: e.target.dataset.item.havesee,
            id: e.target.dataset.item.id,
            index: e.target.dataset.item.index,
            is_new: e.target.dataset.item.is_new,
            love: e.target.dataset.item.love,
            rate: e.target.dataset.item.rate,
            title: e.target.dataset.item.title,
            url: e.target.dataset.item.url,
            want: !e.target.dataset.item.want
          })
        )
      }
    
    }
  },
  // 点击"看过"
  tohavesee: function (e) {
    var that = this;
    this.data.list[e.target.dataset.index].havesee = !this.data.list[e.target.dataset.index].havesee;
    this.setData({
      list: this.data.list
    });
    var haveseearr = wx.getStorageSync('HaveSee') ? wx.getStorageSync('HaveSee') : [];
    var ifwrite = false;
    if (haveseearr.length == 0) {
      wx.setStorageSync('HaveSee', haveseearr.concat({
        cover: e.target.dataset.item.cover,
        id: e.target.dataset.item.id,
        index: e.target.dataset.item.index,
        is_new: e.target.dataset.item.is_new,
        rate: e.target.dataset.item.rate,
        title: e.target.dataset.item.title,
        url: e.target.dataset.item.url,
        want: that.checkif('want', e.target.dataset.item.id) ? true : false,
        love: that.checkif('love', e.target.dataset.item.id) ? true : false,
        havesee: that.checkif('havesee', e.target.dataset.item.id) ? true : false
      }));
      that.selectChange(e.target.dataset.item.id, 'havesee');
    } else {
      for (var i = 0; i < haveseearr.length; i++) {
        if (haveseearr[i].id == e.target.dataset.item.id) {
          this.selectChange(e.target.dataset.item.id, 'havesee');
          var newmovieslist = wx.getStorageSync('HaveSee').filter(item => {
            return item.id != e.target.dataset.item.id
          })
          wx.setStorageSync('HaveSee', newmovieslist);
          ifwrite = false;
          break;
        } else {
          ifwrite = true;
        }
      }
      if (ifwrite == true) {
        this.selectChange(e.target.dataset.item.id, 'havesee');
        wx.setStorageSync('HaveSee', haveseearr.concat({
          cover: e.target.dataset.item.cover,
          havesee: !e.target.dataset.item.havesee,
          id: e.target.dataset.item.id,
          index: e.target.dataset.item.index,
          is_new: e.target.dataset.item.is_new,
          love: e.target.dataset.item.love,
          rate: e.target.dataset.item.rate,
          title: e.target.dataset.item.title,
          url: e.target.dataset.item.url,
          want: e.target.dataset.item.want
        }));

      }
    }

  },
  // 点击"喜欢"
  tolove: function (e) {
    var that = this;
    this.data.list[e.target.dataset.index].love = !this.data.list[e.target.dataset.index].love;
    this.setData({
      list: this.data.list
    });
    var lovearr = wx.getStorageSync('Love') ? wx.getStorageSync('Love') : [];
    var ifwrite = false;
    if (lovearr.length == 0) {
      wx.setStorageSync('Love', lovearr.concat({
        cover: e.target.dataset.item.cover,
        id: e.target.dataset.item.id,
        index: e.target.dataset.item.index,
        is_new: e.target.dataset.item.is_new,
        rate: e.target.dataset.item.rate,
        title: e.target.dataset.item.title,
        url: e.target.dataset.item.url,
        want: that.checkif('want', e.target.dataset.item.id) ? true : false,
        love: that.checkif('love', e.target.dataset.item.id) ? true : false,
        havesee: that.checkif('havesee', e.target.dataset.item.id) ? true : false
      }));
      that.selectChange(e.target.dataset.item.id, 'love');
    } else {
      for (var i = 0; i < lovearr.length; i++) {
        if (lovearr[i].id == e.target.dataset.item.id) {
          this.selectChange(e.target.dataset.item.id, 'love');
          var newmovieslist = wx.getStorageSync('Love').filter(item => {
            return item.id != e.target.dataset.item.id
          })
          wx.setStorageSync('Love', newmovieslist);
          ifwrite = false;
          break;
        } else {
          ifwrite = true;
        }
      }
      if (ifwrite == true) {
        this.selectChange(e.target.dataset.item.id, 'love');
        wx.setStorageSync('Love', lovearr.concat({
          cover: e.target.dataset.item.cover,
          havesee: e.target.dataset.item.havesee,
          id: e.target.dataset.item.id,
          index: e.target.dataset.item.index,
          is_new: e.target.dataset.item.is_new,
          love: !e.target.dataset.item.love,
          rate: e.target.dataset.item.rate,
          title: e.target.dataset.item.title,
          url: e.target.dataset.item.url,
          want: e.target.dataset.item.want
        }));
      }
    }

  },
  // 页面跳转
  // tolink: function (e) {
  //   // console.log(e.target.dataset.link);
  //   getApp().movieslink = e.target.dataset.link;
  //   wx.navigateTo({
  //     url: '../movies/movieslink/movieslink',
  //   })
  // },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})