// app.js
App({
  onLaunch: function () {
    // Disable debug vConsole - standardized way
    wx.setEnableDebug({ enableDebug: false })

    this.globalData = {
      // Supabase Config
      supabaseUrl: "https://ykjguczxobbcgfvmgvup.supabase.co",
      supabaseKey: "sb_publishable_47j6VzDVx0ryQsbj97Bmcw_7YFEtusS",
      editBillId: null
    }
  }
})
