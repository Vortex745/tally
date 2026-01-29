const app = getApp()
const supabase = require('../../utils/supabase.js')

Page({
  data: {
    bills: [],
    totalAmount: '0.00',
    chartData: [
      { day: '一', height: '20rpx', count: 0 },
      { day: '二', height: '20rpx', count: 0 },
      { day: '三', height: '20rpx', count: 0 },
      { day: '四', height: '20rpx', count: 0 },
      { day: '五', height: '20rpx', count: 0 },
      { day: '六', height: '20rpx', count: 0 },
      { day: '日', height: '20rpx', count: 0 }
    ],
    activeDay: null,

    // Pagination & Loading
    page: 0,
    pageSize: 20,
    isEnd: false,
    loading: false,
    isRefreshing: false,
    scrollTop: 0,
    showBackTop: false,
    searchKeyword: '',
    searchExpanded: false
  },

  onLoad: function (options) {
    // Moved to onShow for consistency
  },

  onShow() {
    wx.showTabBar()
    this.refreshData(false)
  },

  onPullDownRefresh() {
    this.refreshData(true)
  },

  onRefresherRefresh() {
    if (this.data.isRefreshing) return
    this.setData({ isRefreshing: true })
    this.refreshData(false).then(() => {
      setTimeout(() => {
        this.setData({ isRefreshing: false })
      }, 500)
    })
  },

  async refreshData(showFeedback = false) {
    this.setData({
      page: 0,
      isEnd: false,
      loading: false
    })
    return this.getBills(true, showFeedback)
  },

  async getBills(isRefresh = false, showFeedback = false) {
    if (this.data.loading && !isRefresh) return
    this.setData({ loading: true })

    if (isRefresh) {
      this.setData({ bills: [], page: 0, isEnd: false })
      this.getStats()
    }

    let url = `/rest/v1/bills?select=*&order=created_at.desc&limit=${this.data.pageSize}&offset=${this.data.page * this.data.pageSize}`

    if (this.data.searchKeyword) {
      url += `&title=ilike.*${encodeURIComponent(this.data.searchKeyword)}*`
    }

    try {
      const rawBills = await supabase.request({ url })

      const newBills = rawBills.map(bill => {
        let displayIcon = '/images/icons/u_pencil.png'
        let isPlaceholder = true

        if (bill.images && bill.images.length > 0) {
          displayIcon = bill.images[0]
          isPlaceholder = false
        }

        // Use recording date (created_at) for home page display
        const createdAt = new Date(bill.created_at)
        const displayDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`

        return {
          ...bill,
          date: displayDate, // Overwrite displayed date with recording date
          displayIcon,
          isPlaceholder
        }
      })

      const allBills = isRefresh ? newBills : this.data.bills.concat(newBills)

      this.setData({
        bills: allBills,
        loading: false,
        isEnd: rawBills.length < this.data.pageSize,
        page: this.data.page + 1
      })

      if (isRefresh) {
        wx.stopPullDownRefresh()
        if (showFeedback) {
          wx.showToast({ title: '刷新成功', icon: 'success' })
        }
      }
    } catch (err) {
      console.error('Fetch bills error:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  getStats() {
    supabase.request({ url: '/rest/v1/bills?select=amount,created_at' }).then(res => {
      const allData = res
      let total = 0
      const counts = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat

      allData.forEach(item => {
        total += (Number(item.amount) || 0)
        if (item.created_at) {
          const day = new Date(item.created_at).getDay()
          counts[day]++
        }
      })

      const maxCount = Math.max(...counts, 1)
      const dayNames = ['日', '一', '二', '三', '四', '五', '六']
      const remapped = [1, 2, 3, 4, 5, 6, 0].map(idx => {
        const count = counts[idx]
        return {
          day: dayNames[idx],
          count: count,
          height: `${Math.max(20, (count / maxCount) * 120)}rpx`,
          isPeak: count === maxCount && count > 0
        }
      })

      this.setData({
        totalAmount: total.toLocaleString(),
        chartData: remapped
      })
    }).catch(err => {
      console.error('Stats error:', err)
    })
  },

  onChartLongPress(e) {
    const { day } = e.currentTarget.dataset
    if (this.data.activeDay === day) {
      this.setData({ activeDay: null })
      return
    }
    this.setData({ activeDay: day })

    if (this._tooltipTimer) clearTimeout(this._tooltipTimer)
    this._tooltipTimer = setTimeout(() => {
      this.setData({ activeDay: null })
    }, 3000)
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.refreshData(false)
  },

  onSearchClear() {
    this.setData({ searchKeyword: '', searchExpanded: false })
    this.refreshData(false)
  },

  toggleSearch() {
    this.setData({
      searchExpanded: !this.data.searchExpanded
    }, () => {
      if (!this.data.searchExpanded && this.data.searchKeyword) {
        this.onSearchClear()
      }
    })
  },

  onPageTap() {
    if (this.data.searchExpanded && !this.data.searchKeyword) {
      this.setData({ searchExpanded: false })
    }
    if (this.data.activeDay) {
      this.setData({ activeDay: null })
    }
  },

  onScroll(e) {
    const showBackTop = e.detail.scrollTop > 300
    if (showBackTop !== this.data.showBackTop) {
      this.setData({ showBackTop })
    }
  },

  scrollToTop() {
    this.setData({ scrollTop: 0 })
  },

  onNoteTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` })
  },

  onImageError(e) {
    const id = e.currentTarget.dataset.id
    const bills = this.data.bills.map(item => {
      if (item.id === id) { // Using id instead of _id for Supabase
        return { ...item, displayIcon: '/images/icons/u_pencil.png', isPlaceholder: true }
      }
      return item
    })
    this.setData({ bills })
  }
})
