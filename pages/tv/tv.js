// pages/movies/movies.js
Page({
  data: {
    // currentlist:0,
    //tagslist:[],
    movieslist: wx.getStorageSync('Movieslist') ? wx.getStorageSync('Movieslist') : [],
    // zerotop:0,
    premovies: 0,//当前从第几条电影开始加载
    currenttype: '热门',//当前左边分栏的激活分类
    currentmovies: 20,//每次加载的电影数
    canscroll: true
  },
  // 页面加载后
  onLoad: function (options) {
    var that = this;
    wx.showToast({
      title: 'Loading......',
      image: '../../images/Loading.gif'
    })
    // 请求左边导航的数据
    wx.request({
      url: 'https://movie.douban.com/j/search_tags?type=tv&source=',
      header: {
        "Content-Type": "application/text"
      },
      success: function (res) {
        that.setData({
          tagslist: res.data.tags,
          currentlist: 0,
          currenttype: res.data.tags[0]
        });
      }
    });
    this.getmovies();
    wx.hideToast();
  },
  // 生命周期函数，监听页面显示
  onShow: function () {
    // 这里自动触发了一次onscroll函数，导致这里面的数据加载有点异常
    this.setData({
      movieslist: [],
      premovies: 0,
      currentmovies: 20
    })
    this.getmovies();
  },
  // 点击左边分类
  taplist: function (e) {
    this.setData({
      zerotop: 0,
      currentlist: e.target.dataset.index,
      currenttype: e.target.dataset.type,
      movieslist: [],
      premovies: 0

    });
    this.getmovies();
  },
  // 页面跳转
  tolink: function (e) {
    getApp().movieslink = e.target.dataset.link;
    wx.navigateTo({
      url: 'tvlink/tvlink',
    })
  },
  // 获取右边数据
  getmovies: function () {
    var that = this;
    wx.request({
      url: "https://movie.douban.com/j/search_subjects?type=tv&sort=recommend&page_limit=" + that.data.currentmovies + "&page_start=" + that.data.premovies + "&tag=" + that.data.currenttype,
      header: {
        "Content-Type": "application/text"
      },
      success: function (res) {
        if (wx.getStorageSync('Movieslist')) {
          that.setData({
            rightcontentlist: wx.getStorageSync('Movieslist')
          })
        } else { //如果没有本地存储，则右边数据为获取到的数据
          for (var i = 0; i < res.data.subjects.length; i++) {
            that.setData({
              movieslist: that.data.movieslist.concat({
                index: i,
                rate: res.data.subjects[i].rate,
                title: res.data.subjects[i].title,
                url: res.data.subjects[i].url,
                cover: res.data.subjects[i].cover,
                id: res.data.subjects[i].id,
                is_new: res.data.subjects[i].is_new,
                want: that.checkif('want', res.data.subjects[i].id) ? that.checkif('want', res.data.subjects[i].id) : false,
                love: that.checkif('love', res.data.subjects[i].id) ? that.checkif('love', res.data.subjects[i].id) : false,
                havesee: that.checkif('havesee', res.data.subjects[i].id) ? that.checkif('havesee', res.data.subjects[i].id) : false
              }),
              canscroll: true
            });
          }
        }
      }
    });

  },
  // 滑动到页面的90%时自动加载下一页
  onscroll: function (e) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    if (e.detail.scrollTop >= e.detail.scrollHeight - this.data.windowHeight - 500 && this.data.canscroll) {
      that.setData({
        premovies: this.data.premovies + this.data.currentmovies,
        currentmovies: 20,
        canscroll: false
      });
      this.getmovies();
    }
  },
  // 判断想看、看过、还是喜欢
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
  selectChange: function (changeId, type) {
    var listArr = ['Want', 'HaveSee', 'Love'];
    for (var i = 0; i < listArr.length; i++) {
      if (wx.getStorageSync(listArr[i])) {
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
    this.data.movieslist[e.target.dataset.index].want = !this.data.movieslist[e.target.dataset.index].want;
    // 并更新rightcontentlist的数据
    this.setData({
      movieslist: this.data.movieslist
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
    this.data.movieslist[e.target.dataset.index].havesee = !this.data.movieslist[e.target.dataset.index].havesee;
    this.setData({
      movieslist: this.data.movieslist
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
    this.data.movieslist[e.target.dataset.index].love = !this.data.movieslist[e.target.dataset.index].love;
    this.setData({
      movieslist: this.data.movieslist
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