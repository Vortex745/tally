const supabase = require('../../utils/supabase.js')

Page({
    data: {
        id: '',
        bill: {},
        navPaddingTop: 44,
        menuButtonRight: 0,
        displayImages: []
    },

    onLoad(options) {
        const systemInfo = wx.getSystemInfoSync()
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
        const navPaddingTop = menuButtonInfo.top
        const menuButtonRight = systemInfo.screenWidth - menuButtonInfo.left + 10

        this.setData({
            navPaddingTop,
            menuButtonRight
        })

        if (options.id) {
            this.setData({ id: options.id })
            this.getBill(options.id)
        }
    },

    onShow() {
        if (this.data.id) {
            this.getBill(this.data.id)
        }
    },

    async getBill(id) {
        try {
            const res = await supabase.request({ url: `/rest/v1/bills?id=eq.${id}&select=*` })
            if (res.length > 0) {
                const bill = res[0]
                this.setData({
                    bill: bill,
                    displayImages: bill.images || []
                })
            }
        } catch (err) {
            console.error(err)
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    edit() {
        wx.navigateTo({
            url: `/pages/edit/index?id=${this.data.id}`
        })
    },

    delete() {
        wx.showModal({
            title: '提示',
            content: '确定要删除这条记录吗？',
            success: (res) => {
                if (res.confirm) {
                    this.doDelete()
                }
            }
        })
    },

    doDelete() {
        wx.showLoading({ title: '删除中' })
        supabase.request({
            url: `/rest/v1/bills?id=eq.${this.data.id}`,
            method: 'DELETE'
        }).then(res => {
            wx.hideLoading()
            wx.showToast({ title: '删除成功' })
            setTimeout(() => {
                wx.navigateBack()
            }, 1000)
        }).catch(err => {
            wx.hideLoading()
            console.error(err)
            wx.showToast({ title: '删除失败', icon: 'none' })
        })
    },

    onBack() {
        wx.navigateBack()
    },

    previewImage(e) {
        const url = e.currentTarget.dataset.url
        wx.previewImage({
            urls: this.data.displayImages,
            current: url
        })
    }
})
