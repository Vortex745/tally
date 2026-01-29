// miniprogram/utils/supabase.js
const app = getApp()

const supabaseRequest = (options) => {
    const { url, method = 'GET', data = {}, headers = {} } = options
    const app = getApp()
    const baseUrl = app.globalData.supabaseUrl
    const apiKey = app.globalData.supabaseKey

    return new Promise((resolve, reject) => {
        wx.request({
            url: `${baseUrl}${url}`,
            method,
            data,
            header: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                ...headers
            },
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data)
                } else {
                    reject(res)
                }
            },
            fail: reject
        })
    })
}

const supabaseUpload = (options) => {
    const { filePath, bucket, fileName } = options
    const app = getApp()
    const baseUrl = app.globalData.supabaseUrl
    const apiKey = app.globalData.supabaseKey

    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: `${baseUrl}/storage/v1/object/${bucket}/${fileName}`,
            filePath,
            name: 'file',
            header: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`,
                'cache-control': '3600'
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    // Construct public URL
                    const publicUrl = `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`
                    resolve({ publicUrl })
                } else {
                    reject(res)
                }
            },
            fail: reject
        })
    })
}

module.exports = {
    request: supabaseRequest,
    upload: supabaseUpload
}
