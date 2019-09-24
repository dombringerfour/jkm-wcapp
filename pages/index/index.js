// pages/index/index.js
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')//判断当前微信版本能否使用button.open-type.getUserInfo
  },
  onLoad: function (options) {
    var that = this;
    // wx.request({
    //   // url: 'https://movie.douban.com/j/search_tags?type=movie&source=index',//豆瓣电影导航栏接口
    //   // url:'https://api.douban.com/v2/movie/top250',//豆瓣top250接口
    //   // url:'https://api.budejie.com/api/api_open.php?a=list&c=data&type=41&page=1&maxtime=0',//某视频api
    //   url:'https://movie.douban.com/j/search_subjects?type=movie&tag=%E7%83%AD%E9%97%A8&page_limit=50&page_start=0',//豆瓣电影接口
    //   // url: "https://movie.douban.com/j/search_subjects?type=tv&sort=recommend&page_limit=" + that.data.currentmovies + "&page_start=" + that.data.premovies + "&tag=" + that.data.currenttype,//豆瓣电视剧接口
    //   // url: 'https://movie.douban.com/j/search_tags?type=tv&source=',//豆瓣左边导航接口
    //   // method:'POST',
    //   method:'GET',
    //   header: {
    //     // "Content-Type":"application/json"
    //     //这里修改json为text   json的话请求会返回400（bad request）
    //     "Content-Type": "application/text"
    //   },
    //   success:function(res){
    //     console.log(res);
    //     that.setData({
    //       // list:res.data.tags
    //     })
    //   }
    // })

    // 旧版本获取用户授权
    // wx.getUserInfo({
    //   success:function(res){
    //     // console.log(res);
    //     that.setData({
    //       head:res.userInfo.avatarUrl,
    //       uname:res.userInfo.nickName
    //     })
    //   }
    // })
  },
  tomovies:function(){
    wx.switchTab({
      url: '../movies/movies',
    })
  },
  onGotUserInfo: function (e) {
    var that = this;
    // console.log(e.detail)
    // 用户登录
    // wx.login({
    //   success:res=>{
    //     console.log(res)
    //   }
    // })
    // 用户确定授权
    if(e.detail.userInfo){
      this.tomovies();
    }else{
      wx.showModal({
        title: 'Warn',
        content: '您拒绝授权，无法进入小程序',
        showCancel:false,
        confirmText:'返回授权'
      })
    }
  },
  aaa:function(){
    console.log(wx.canIUse('button.open-type.getUserInfo'));//小程序的API，回调，参数，组件等是否在当前版本可用。
    // wx.getUserInfo({
    //   success:function(res){
    //     console.log(res);
    //   }
    // })
    wx.getSetting({
      success:function(res){
        console.log(res);
        if(res.authSetting['scope.userInfo']){
          console.log(1);
        }
      }
    })
  }
})