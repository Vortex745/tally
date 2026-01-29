# Tunshu (豚鼠记账) 🐹

**一款基于微信小程序原生开发 + Supabase 后端的简约记账应用。**

本项目旨在提供极简的记账体验，支持收支记录、自定义日期、图表统计以及云端数据同步。

## ✨ 功能特性

- **极简录入**：快速记录日常收支，支持自定义标题、金额、数量、备注。
- **自定义日期**：首页列表按“录入时间”排序，详情页保留真实“消费日期”。
- **图表统计**：首页直观展示近日记录频率（长按查看具体笔数）。
- **云端同步**：基于 Supabase BaaS 服务，数据安全存储于云端。
- **UI 设计**：采用暖色调（巧克力/奶油/橙色）设计，从图标到交互细节都经过精心打磨。

## 🛠️ 技术栈

- **前端**：微信小程序原生 (WXML, WXSS, JS, JSON)
- **后端/数据库**：Supabase (PostgreSQL, Storage)

## 🚀 快速开始

### 1. 准备工作
- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
- 注册 [Supabase](https://supabase.com/) 账号并创建一个新项目。

### 2. 获取源码
```bash
git clone <repository-url>
```

### 3. 项目配置
1. 打开微信开发者工具，导入本项目根目录。
2. 在 `miniprogram/app.js` 中配置您的 Supabase 信息：

```javascript
// miniprogram/app.js
App({
  globalData: {
    supabaseUrl: 'YOUR_SUPABASE_URL',
    supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
    // ...
  }
})
```

3. 在 Supabase 中创建 `bills` 表：
   - 字段建议：`id`, `title`, `amount`, `date`, `created_at`, `images`, `type`, `note`, `quantity`, `breed`, `gender`, `age`.

### 4. 运行
点击开发者工具的“编译”按钮即可预览。

## 📂 目录结构

```
e:/tunshu1
├── miniprogram/          # 小程序核心代码
│   ├── pages/            # 页面目录 (index, add, edit, detail)
│   ├── utils/            # 工具类 (supabase.js)
│   ├── images/           # 图片资源
│   └── app.js            # 全局入口
├── project.config.json   # 项目配置文件
└── README.md             # 项目说明文档
```

## 📝 注意事项
- 首页列表显示的日期为 **记录录入时间** (`created_at`)，方便回溯操作历史。
- 详情页显示的日期为 **实际消费日期** (`date`)。

## 📄 License
MIT
