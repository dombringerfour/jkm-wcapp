// pages/search/search.js
Page({
  data: {
    text:'',//input框的内容
    searchList:[]//搜索出来的内容
  },
  onLoad: function (options) {
    // https://movie.douban.com/j/subject_suggest?q=%E9%93%B6%E9%AD%82  搜索接口
  },
  onShow: function () {
    this.getSearchListInfo();
  },
  search:function(e){
    console.log(e);
    var that = this;
    this.setData({
      text:e.detail.value,
      searchList:[]
    });
    wx.showLoading({
      title: 'Loading...',
    });
    this.getSearchListInfo();
    wx.hideLoading();
  },
  // 设置data中的text
  setDataText:function(e){
    this.setData({
      text: e.detail.value
    });
  },
  // 点击推荐搜索标签设置data中的text
  setTextandSearch:function(e){
    this.setData({
      text:e.target.dataset.text
    })
    this.getSearchListInfo();
  },
  // 获取搜索出来的内容
  getSearchListInfo:function(){
    var that = this;
    this.setData({
      searchList: []
    })
    wx.request({
      url: 'https://movie.douban.com/j/subject_suggest?q=' + that.data.text,
      header: {
        "Content-Type": "application/text"
      },
      success: function (res) {
        for (var i = 0; i < res.data.length; i++) {
          that.setData({
            searchList: that.data.searchList.concat({
              id: res.data[i].id,
              cover: res.data[i].img,
              sub_title: res.data[i].sub_title,
              title: res.data[i].title,
              url: res.data[i].url,
              rate: res.data[i].year,
              want: that.checkif('want', res.data[i].id) ? that.checkif('want', res.data[i].id) : false,
              love: that.checkif('love', res.data[i].id) ? that.checkif('love', res.data[i].id) : false,
              havesee: that.checkif('havesee', res.data[i].id) ? that.checkif('havesee', res.data[i].id) : false
            })
          })
        }
      }
    })
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
  // 点击“想看”
  towant: function (e) {
    var dataset = e.target.dataset;
    var that = this;
    // 改变当前数据的want的值，取反表示是否想看
    this.data.searchList[e.target.dataset.index].want = !this.data.searchList[e.target.dataset.index].want;
    // 并更新rightcontentlist的数据
    this.setData({
      searchList: this.data.searchList
    }, function () {
    });
    // 从本地存储中获取数据
    var wantarr = wx.getStorageSync('Want') ? wx.getStorageSync('Want') : [];
    // 定义可写入本地存储的开关为关闭状态
    var ifwrite = false;
    // 当本地存储中没有数据时
    if (wantarr.length == 0) {
      wx.setStorageSync('Want', wantarr.concat({
        cover: e.target.dataset.item.cover,
        havesee: e.target.dataset.item.havesee,
        id: e.target.dataset.item.id,
        index: e.target.dataset.item.index,
        is_new: e.target.dataset.item.is_new,
        love: e.target.dataset.item.love,
        rate: e.target.dataset.item.rate,
        title: e.target.dataset.item.title,
        url: e.target.dataset.item.url,
        want: e.target.dataset.item.want
      }));
      that.selectChange(e.target.dataset.item.id, 'want');
    } else {//本地存储有数据时
      for (var i = 0; i < wantarr.length; i++) {
        // 每一条进行判断，如果相等则表示本地存储中有这条数据，开关关闭，跳出循环，只有所有数据都不等于当前写入电影的id，才开关才会被打开
        if (wantarr[i].id == e.target.dataset.item.id) {
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
      // 如果开关是开的状态，写入数据
      if (ifwrite == true) {
        // 将rightcontentlist数据写入本地存储（这里是同步存储，替换原来本地存储中的数据）
        wx.setStorageSync('Want', wantarr.concat({
          cover: e.target.dataset.item.cover,
          havesee: e.target.dataset.item.havesee,
          id: e.target.dataset.item.id,
          index: e.target.dataset.item.index,
          is_new: e.target.dataset.item.is_new,
          love: e.target.dataset.item.love,
          rate: e.target.dataset.item.rate,
          title: e.target.dataset.item.title,
          url: e.target.dataset.item.url,
          want: e.target.dataset.item.want
        }));
        that.selectChange(e.target.dataset.item.id, 'want');
      }
    }
  },
  // 点击"看过"
  tohavesee: function (e) {
    var that = this;
    this.data.searchList[e.target.dataset.index].havesee = !this.data.searchList[e.target.dataset.index].havesee;
    this.setData({
      searchList: this.data.searchList
    });
    var haveseearr = wx.getStorageSync('HaveSee') ? wx.getStorageSync('HaveSee') : [];
    var ifwrite = false;
    if (haveseearr.length == 0) {
      wx.setStorageSync('HaveSee', haveseearr.concat({
        cover: e.target.dataset.item.cover,
        havesee: e.target.dataset.item.havesee,
        id: e.target.dataset.item.id,
        index: e.target.dataset.item.index,
        is_new: e.target.dataset.item.is_new,
        love: e.target.dataset.item.love,
        rate: e.target.dataset.item.rate,
        title: e.target.dataset.item.title,
        url: e.target.dataset.item.url,
        want: e.target.dataset.item.want
      }));
      that.selectChange(e.target.dataset.item.id, 'havesee');
    } else {
      for (var i = 0; i < haveseearr.length; i++) {
        if (haveseearr[i].id == e.target.dataset.item.id) {
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
        wx.setStorageSync('HaveSee', haveseearr.concat({
          cover: e.target.dataset.item.cover,
          havesee: e.target.dataset.item.havesee,
          id: e.target.dataset.item.id,
          index: e.target.dataset.item.index,
          is_new: e.target.dataset.item.is_new,
          love: e.target.dataset.item.love,
          rate: e.target.dataset.item.rate,
          title: e.target.dataset.item.title,
          url: e.target.dataset.item.url,
          want: e.target.dataset.item.want
        }));
        that.selectChange(e.target.dataset.item.id, 'havesee');
      }
    }

  },
  // 点击"喜欢"
  tolove: function (e) {
    var that = this;
    this.data.searchList[e.target.dataset.index].love = !this.data.searchList[e.target.dataset.index].love;
    this.setData({
      searchList: this.data.searchList
    });
    var lovearr = wx.getStorageSync('Love') ? wx.getStorageSync('Love') : [];
    var ifwrite = false;
    if (lovearr.length == 0) {
      wx.setStorageSync('Love', lovearr.concat({
        cover: e.target.dataset.item.cover,
        havesee: e.target.dataset.item.havesee,
        id: e.target.dataset.item.id,
        index: e.target.dataset.item.index,
        is_new: e.target.dataset.item.is_new,
        love: e.target.dataset.item.love,
        rate: e.target.dataset.item.rate,
        title: e.target.dataset.item.title,
        url: e.target.dataset.item.url,
        want: e.target.dataset.item.want
      }));
      that.selectChange(e.target.dataset.item.id, 'love');
    } else {
      for (var i = 0; i < lovearr.length; i++) {
        if (lovearr[i].id == e.target.dataset.item.id) {
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
        wx.setStorageSync('Love', lovearr.concat({
          cover: e.target.dataset.item.cover,
          havesee: e.target.dataset.item.havesee,
          id: e.target.dataset.item.id,
          index: e.target.dataset.item.index,
          is_new: e.target.dataset.item.is_new,
          love: e.target.dataset.item.love,
          rate: e.target.dataset.item.rate,
          title: e.target.dataset.item.title,
          url: e.target.dataset.item.url,
          want: e.target.dataset.item.want
        }));
        that.selectChange(e.target.dataset.item.id, 'love');
      }
    }
  }
})