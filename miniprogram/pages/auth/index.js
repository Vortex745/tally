Page({
  data: {
    code: ''
  },
  onInput(e) {
    this.setData({ code: e.detail.value })
  },
  verify() {
    const code = this.data.code.trim()
    if (code) {
      wx.setStorageSync('recordCode', code)
      wx.switchTab({
        url: '/pages/index/index',
      })
    } else {
      wx.showToast({
        title: '请输入记录码',
        icon: 'none'
      })
    }
  }
})
