const supabase = require('../../utils/supabase.js')

const years = []
const months = []
const days = []
for (let i = 2020; i <= 2030; i++) years.push(i)
for (let i = 1; i <= 12; i++) months.push(i)
for (let i = 1; i <= 31; i++) days.push(i)

Page({
    data: {
        title: '',
        amount: '',
        quantity: '1',
        age: '',
        date: '',
        note: '',
        images: [],
        maxImages: 6,
        breed: '',
        gender: '',
        id: '',

        // Custom Picker Data
        showCustomPicker: false,
        years,
        months,
        days,
        pvdValues: [6, 0, 28]
    },

    onLoad(options) {
        if (options.id) {
            this.setData({ id: options.id })
            this.getRecord(options.id)
        }
    },

    getRecord(id) {
        wx.showLoading({ title: '加载中' })
        supabase.request({ url: `/rest/v1/bills?id=eq.${id}&select=*` }).then(res => {
            if (res.length > 0) {
                const data = res[0]
                this.setData({
                    title: data.title || '',
                    quantity: data.quantity || '1',
                    amount: data.amount || '',
                    age: data.age || '',
                    date: data.date || '',
                    note: data.note || '',
                    breed: data.breed || '',
                    gender: data.gender || '',
                    images: data.images || []
                })
            }
            wx.hideLoading()
        }).catch(err => {
            wx.hideLoading()
            wx.showToast({ title: '加载失败', icon: 'none' })
        })
    },

    onTitleInput(e) { this.setData({ title: e.detail.value }) },
    onAmountInput(e) { this.setData({ amount: e.detail.value }) },
    onQuantityInput(e) { this.setData({ quantity: e.detail.value }) },
    onAgeInput(e) { this.setData({ age: e.detail.value }) },
    onNoteInput(e) { this.setData({ note: e.detail.value }) },
    onBreedInput(e) { this.setData({ breed: e.detail.value }) },
    onGenderInput(e) { this.setData({ gender: e.detail.value }) },

    toggleDatePicker() {
        this.setData({ showCustomPicker: !this.data.showCustomPicker })
    },

    onPickerViewChange(e) {
        this.setData({ pvdValues: e.detail.value })
    },

    confirmDate() {
        const val = this.data.pvdValues
        const y = this.data.years[val[0]]
        const m = String(this.data.months[val[1]]).padStart(2, '0')
        const d = String(this.data.days[val[2]]).padStart(2, '0')
        const newDate = `${y}-${m}-${d}`
        this.setData({
            date: newDate,
            showCustomPicker: false
        })
    },

    chooseImage() {
        const remaining = this.data.maxImages - this.data.images.length
        if (remaining <= 0) return

        wx.chooseMedia({
            count: remaining,
            mediaType: ['image'],
            success: (res) => {
                wx.showLoading({ title: '处理中...', mask: true })
                const images = this.data.images.concat(res.tempFiles.map(f => f.tempFilePath))
                this.setData({ images })
                wx.hideLoading()
            }
        })
    },

    removeImage(e) {
        const index = e.currentTarget.dataset.index
        const images = this.data.images
        images.splice(index, 1)
        this.setData({ images })
    },

    async save() {
        const { title, amount, quantity, age, date, note, images, id, breed, gender } = this.data

        if (!title) {
            wx.showToast({ title: '请输入订单编号', icon: 'none' })
            return
        }
        if (!amount || Number(amount) <= 0) {
            wx.showToast({ title: '请输入价格', icon: 'none' })
            return
        }

        wx.showLoading({ title: '保存中', mask: true })

        try {
            const uploadTasks = images.map(async (path) => {
                if (path.startsWith('http')) return path
                const ext = path.split('.').pop() || 'jpg'
                const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`
                const res = await supabase.upload({
                    filePath: path,
                    bucket: 'bills',
                    fileName
                })
                return res.publicUrl
            })

            const uploadedUrls = await Promise.all(uploadTasks)

            const dataPayload = {
                title,
                amount: parseFloat(amount),
                quantity: parseInt(quantity) || 1,
                age,
                date,
                note,
                images: uploadedUrls,
                breed,
                gender,
                type: 'expense'
            }

            await supabase.request({
                url: `/rest/v1/bills?id=eq.${id}`,
                method: 'PATCH',
                data: dataPayload
            })

            wx.hideLoading()
            wx.showToast({ title: '更新成功' })
            setTimeout(() => {
                wx.navigateBack()
            }, 1000)

        } catch (err) {
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
            console.error('Save error:', err)
        }
    },

    cancel() {
        wx.navigateBack()
    }
})
